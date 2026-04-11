<template>
  <div class="w-full h-full bg-white relative">
    <template v-if="categoryWebsites.length">
      <t-tabs
        v-model="currentCategoryId"
        theme="card"
        addable
        @add="handleOpenCategoryDialog('create')"
        @remove="handleRemoveCategory"
        @change="handleCategoryChange"
      >
        <t-tab-panel v-for="item in categoryWebsites" :key="item.id" :value="item.id" removable>
          <template #label>
            <div class="flex items-center justify-between"></div>
            <span>{{ item.name }}</span>
            <HiIcon
              name="icon-bianji"
              size="14px"
              class="ml-2 text-[var(--td-text-color-secondary)] hover:text-[var(--td-brand-color)]"
              @click="handleOpenCategoryDialog('edit', item)"
            />
          </template>
        </t-tab-panel>
      </t-tabs>
      <div class="p-4 h-[calc(100%-48px)]">
        <div class="flex items-center mb-4 gap-2">
          <t-button @click="handleOpenWebsiteDialog('create')">新增网站</t-button>
          <t-button theme="danger" @click="handleBatchDeleteWebsites">删除网站</t-button>
        </div>
        <t-table
          style="height: calc(100% - 48px)"
          height="100%"
          rowKey="id"
          :data="websitesTableData"
          :columns="columns"
          :stripe="false"
          :bordered="false"
          :hover="true"
          size="small"
          :table-layout="'fixed'"
          cellEmptyContent="--"
          resizable
          :selected-row-keys="selectedRowKeys"
          @select-change="handleTableSelectChange"
        >
          <template #url="{ row }">
            <t-link theme="primary" :href="row.url" target="_blank">{{ row.url }}</t-link>
          </template>
          <template #icon="{ row }">
            <t-image :src="row.icon" :style="{ width: '24px', height: '24px', backgroundColor: 'transparent' }">
              <template #error>
                <HiIcon name="icon-tupianjiazaishibai" size="24px" />
              </template>
            </t-image>
          </template>
          <template #tags="{ row }">
            <template v-if="row.tags.length">
              <t-tag
                class="!mr-1"
                v-for="(tag, index) in row.tags"
                :key="index"
                theme="primary"
                variant="light-outline"
              >
                {{ tag }}
              </t-tag>
            </template>
            <span v-else>--</span>
          </template>

          <template #operate="{ row }">
            <t-button theme="primary" variant="text" size="small" @click="handleOpenWebsiteDialog('edit', row)">
              编辑
            </t-button>
            <t-button theme="danger" variant="text" size="small" @click="handleRemoveWebsite(row)">删除</t-button>
          </template>
        </t-table>
      </div>
    </template>
    <t-empty v-else class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <template #action>
        <t-button @click="handleOpenCategoryDialog('create')">新增分类</t-button>
      </template>
    </t-empty>

    <CategoryConfigDialog
      ref="categoryConfigDialogRef"
      :directoryId="props.directoryId"
      @refresh="getCategoryByDirectoryId"
    />

    <WebsiteConfigDialog
      ref="websiteConfigDialogRef"
      :directoryId="props.directoryId"
      :categoryId="currentCategoryId"
      @refresh="getWebsitesByCategory"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { Category, Website } from '@/db/models'
import { DialogPlugin, MessagePlugin, type TdBaseTableProps, type TdTabPanelProps } from 'tdesign-vue-next'
import { useCategoryApi } from '@/composable/api'
import { useWebsiteApi } from '@/composable/api'
import CategoryConfigDialog from './CategoryConfigDialog.vue'
import WebsiteConfigDialog from './WebsiteConfigDialog.vue'

const props = defineProps<{
  directoryId: string
}>()

const categoryConfigDialogRef = ref<InstanceType<typeof CategoryConfigDialog>>()
const currentCategoryId = ref<string>('')
const categoryWebsites = ref<Array<Category>>([])

const websitesTableData = ref<Website[]>([])
// TdBaseTableProps['columns']
const columns = ref([
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  },
  {
    title: '网站地址',
    colKey: 'url',
    minWidth: 200,
    ellipsis: true,
  },
  {
    title: '网站名称',
    colKey: 'name',
    width: 200,
    ellipsis: true,
  },
  {
    title: '网站图标',
    colKey: 'icon',
    width: 100,
    ellipsis: true,
  },
  // {
  //   title: '排序',
  //   colKey: 'order',
  //   width: 100,
  // },
  {
    title: '描述',
    colKey: 'description',
    minWidth: 280,
    ellipsis: true,
  },
  {
    title: '标签',
    colKey: 'tags',
    width: 200,
    ellipsis: true,
  },
  {
    title: '操作',
    colKey: 'operate',
    width: 100,
    fixed: 'right',
  },
])
const websiteConfigDialogRef = ref<InstanceType<typeof WebsiteConfigDialog>>()

const selectedRowKeys = ref<string[]>([])

const handleOpenCategoryDialog = (type: 'create' | 'edit', row?: Category) => {
  categoryConfigDialogRef.value?.handleOpen(type, row)
}

// 获取目录下的分类
const getCategoryByDirectoryId = () => {
  useCategoryApi()
    .getAllCategoriesById(props.directoryId)
    .then(res => {
      categoryWebsites.value = res
      currentCategoryId.value = categoryWebsites.value[0]?.id || ''
      getWebsitesByCategory()
    })
}

watch(
  () => props.directoryId,
  value => {
    if (value) {
      getCategoryByDirectoryId()
    }
  }
)

// 分类变化时获取该分类下的网站列表
const handleCategoryChange = () => {
  getWebsitesByCategory()
}

const handleRemoveCategory = ({ value }: { value: string }) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除分类?',
    body: '此将同步删除该分类下的网站且不可恢复，请谨慎操作!',
    theme: 'warning',
    onConfirm: () => {
      useCategoryApi()
        .deleteCategory(value)
        .then(() => {
          getCategoryByDirectoryId()
          dialog.destroy()
        })
        .catch(err => {
          MessagePlugin.error(err || '删除失败')
        })
    },
    onClose: () => {
      dialog.destroy()
    },
  })
}

// 打开网站配置弹窗
const handleOpenWebsiteDialog = (type: 'create' | 'edit', row?: Website) => {
  websiteConfigDialogRef.value?.handleOpen(type, row)
}

// 获取分类下的网站列表
const getWebsitesByCategory = () => {
  useWebsiteApi()
    .getWebsitesByCategoryId(currentCategoryId.value)
    .then(res => {
      websitesTableData.value = res
      console.log('websitesTableData', websitesTableData.value)
    })
}

// 删除网站
const handleRemoveWebsite = (row: Website) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除该网站?',
    body: '此操作将删除该网站且不可恢复，请谨慎操作!',
    theme: 'warning',
    onConfirm: () => {
      useWebsiteApi()
        .deleteWebsite(row.id)
        .then(() => {
          getWebsitesByCategory()
          dialog.destroy()
        })
        .catch(err => {
          MessagePlugin.error(err || '删除失败')
        })
    },
    onClose: () => {
      dialog.destroy()
    },
  })
}

const handleTableSelectChange = (selects: string[]) => {
  selectedRowKeys.value = selects
}

const handleBatchDeleteWebsites = () => {
  if (!selectedRowKeys.value.length) return MessagePlugin.error('请选择待删除的网站')
  const dialog = DialogPlugin.confirm({
    header: '确认删除所选网站?',
    body: '此操作将删除网站且不可恢复，请谨慎操作!',
    theme: 'warning',
    onConfirm: () => {
      useWebsiteApi()
        .batchDeleteWebsite(selectedRowKeys.value)
        .then(() => {
          getWebsitesByCategory()
          dialog.destroy()
        })
        .catch(err => {
          MessagePlugin.error(err || '删除失败')
        })
    },
    onClose: () => {
      dialog.destroy()
    },
  })
}
</script>
