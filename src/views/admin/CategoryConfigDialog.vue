<template>
  <t-dialog
    header="添加分类"
    v-model:visible="visible"
    width="720px"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleCancel"
  >
    <t-form :data="formData" :rules="rules" ref="formRef">
      <t-form-item label="分类名称" name="name">
        <t-input v-model="formData.name" placeholder="请输入分类名称"></t-input>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import type { Category } from '@/db/models'
import { useCategoryApi } from '@/composable/api'
import { MessagePlugin } from 'tdesign-vue-next'

const { createCategory, updateCategory } = useCategoryApi()
const props = defineProps<{
  directoryId: string
}>()
const emit = defineEmits(['refresh'])

const visible = ref<boolean>(false)
const formData = ref<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'directoryId'>>({
  name: '',
})
const rules = ref({
  name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
})
const formRef = ref()
const dialogType = ref<'create' | 'edit'>('create')
const rowItem = ref<Category>()

const handleOpen = (type: 'create' | 'edit', item?: Category) => {
  visible.value = true
  dialogType.value = type
  rowItem.value = item
  if (type === 'create') {
    formData.value = {
      name: '',
    }
  } else {
    formData.value = {
      name: item?.name || '',
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
    createCategory({ ...data, directoryId: props.directoryId })
      .then(id => {
        console.log('createDirectory***', id)
        MessagePlugin.success('添加分类成功')
        emit('refresh')
        handleCancel()
      })
      .catch(err => {
        MessagePlugin.error(err.message || '添加分类失败')
      })
  } else {
    updateCategory(rowItem.value!.id, data)
      .then(res => {
        console.log('updateCategory', res)
        MessagePlugin.success('更新分类成功')
        emit('refresh')
        handleCancel()
      })
      .catch(err => {
        MessagePlugin.error(err.message || '更新分类失败')
      })
  }
}

const handleCancel = (): void => {
  visible.value = false
}

defineExpose({
  handleOpen,
})
</script>
