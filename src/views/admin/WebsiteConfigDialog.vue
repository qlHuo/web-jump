<template>
  <t-dialog
    header="添加网站"
    v-model:visible="visible"
    width="720px"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleCancel"
  >
    <t-form :data="formData" :rules="rules" ref="formRef">
      <t-form-item label="网站地址" name="url">
        <t-input v-model="formData.url" placeholder="请输入网站地址"></t-input>
      </t-form-item>
      <t-form-item label="网站名称" name="name">
        <t-input v-model="formData.name" placeholder="请输入网站名称"></t-input>
      </t-form-item>
      <t-form-item label="网站图标" name="icon">
        <t-input v-model="formData.icon" placeholder="请输入网站图标链接"></t-input>
      </t-form-item>
      <t-form-item label="网站描述" name="description">
        <t-textarea
          v-model="formData.description"
          placeholder="请输入网站描述"
          :autosize="{ minRows: 3, maxRows: 5 }"
        />
      </t-form-item>
      <t-form-item label="标签" name="tags">
        <t-tag-input v-model="formData.tags" clearable />
      </t-form-item>
    </t-form>
  </t-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import type { Website } from '@/db/models'
import { useWebsiteApi } from '@/composable/api'
import { MessagePlugin } from 'tdesign-vue-next'

const props = defineProps<{
  directoryId: string
  categoryId: string
}>()

const emit = defineEmits(['refresh'])

const visible = ref<boolean>(false)
const formData = ref<
  Omit<Website, 'id' | 'createdAt' | 'updatedAt' | 'order'> & {
    order?: number
  }
>({
  name: '',
  url: '',
  icon: '',
  description: '',
  tags: [],
  isPinned: false,
  directoryId: props.directoryId,
  categoryId: props.categoryId,
})
const rules = ref({
  name: [
    { required: true, message: '网站地址不能为空' },
    { whitespace: true, message: '网站名称不能为空', trigger: 'blur' },
  ],
  url: [
    { required: true, message: '网站地址不能为空' },
    {
      url: {
        protocols: ['http', 'https'],
        require_protocol: true,
      },
      message: '请输入正确的网站地址',
    },
  ],
  description: [
    { required: true, message: '网站描述不能为空' },
    { whitespace: true, message: '网站描述不能为空', trigger: 'blur' },
  ],
})
const formRef = ref()
const dialogType = ref<'create' | 'edit'>('create')
const rowItem = ref<Website>()

const handleOpen = (type: 'create' | 'edit', item?: Website) => {
  visible.value = true
  dialogType.value = type
  rowItem.value = item
  if (type === 'create') {
    formData.value = {
      name: '',
      url: '',
      icon: '',
      description: '',
      tags: [],
      isPinned: false,
      directoryId: props.directoryId,
      categoryId: props.categoryId,
    }
  } else {
    const {
      name = '',
      url = '',
      icon = '',
      description = '',
      tags = [],
      isPinned = false,
      directoryId = '',
      categoryId = '',
    } = item || {}
    formData.value = {
      name,
      url,
      icon,
      description,
      tags,
      isPinned,
      directoryId,
      categoryId,
    }
  }
}

const handleConfirm = async () => {
  const valid = await formRef.value?.validate()
  if (typeof valid !== 'boolean' || !valid) return false
  const data = {
    ...formData.value,
  }
  if (dialogType.value === 'create') {
    useWebsiteApi()
      .createWebsite({ ...data })
      .then(() => {
        MessagePlugin.success('添加网站成功')
        emit('refresh')
        handleCancel()
      })
      .catch(err => {
        MessagePlugin.error(err.message || '添加网站失败')
      })
  } else {
    useWebsiteApi()
      .updateWebsite(rowItem.value!.id, data)
      .then(res => {
        console.log('updateWebsite', res)
        MessagePlugin.success('更新网站成功')
        emit('refresh')
        handleCancel()
      })
      .catch(err => {
        MessagePlugin.error(err.message || '更新网站失败')
      })
  }
}

const handleCancel = (): void => {
  visible.value = false
  formRef.value.reset()
}

defineExpose({
  handleOpen,
})
</script>
