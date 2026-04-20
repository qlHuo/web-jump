<template>
  <t-dialog
    header="添加目录"
    v-model:visible="visible"
    width="720px"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleCancel"
  >
    <t-form :data="formData" :rules="rules" ref="formRef">
      <t-form-item label="目录名称" name="name">
        <t-input v-model="formData.name" placeholder="请输入目录名称"></t-input>
      </t-form-item>
      <t-form-item label="目录Key" name="key" help="目录key只能包含英文字母和数字">
        <t-input v-model="formData.key" placeholder="请输入目录Key"></t-input>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import type { Directory } from '@/db/models'
import { useDirectoryApi } from '@/composable/api/useDirectoryApi'
import { MessagePlugin } from 'tdesign-vue-next'

const { createDirectory, updateDirectory } = useDirectoryApi()
const emit = defineEmits(['refresh'])

const visible = ref<boolean>(false)
const formData = ref<Omit<Directory, 'id' | 'createdAt' | 'updatedAt' | 'order'>>({
  name: '',
  key: '',
})
const rules = ref({
  name: [{ required: true, message: '目录名称不能为空', trigger: 'blur' }],
  key: [
    { required: true, message: '目录Key不能为空', trigger: 'blur' },
    {
      validator: (val: string) => /^[a-zA-Z0-9]+$/.test(val),
      message: '目录Key只能包含英文字母和数字',
      trigger: 'blur',
    },
  ],
})
const formRef = ref()
const dialogType = ref<'create' | 'edit'>('create')
const rowItem = ref<Directory>()

const handleOpen = (type: 'create' | 'edit', item?: Directory) => {
  visible.value = true
  dialogType.value = type
  rowItem.value = item
  if (type === 'create') {
    formData.value = {
      name: '',
      key: '',
    }
  } else {
    formData.value = {
      name: item?.name || '',
      key: item?.key || '',
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
    createDirectory(data)
      .then(id => {
        console.log('createDirectory***', id)
        MessagePlugin.success('添加目录成功')
        emit('refresh')
        handleCancel()
      })
      .catch(err => {
        MessagePlugin.error(err.message || '添加目录失败')
      })
  } else {
    updateDirectory(rowItem.value!.id, data)
      .then(res => {
        console.log('updateDirectory', res)
        MessagePlugin.success('更新目录成功')
        emit('refresh')
        handleCancel()
      })
      .catch(err => {
        MessagePlugin.error(err.message || '更新目录失败')
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
