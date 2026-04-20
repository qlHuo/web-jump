<template>
  <t-dialog
    header="导入数据"
    v-model:visible="visible"
    width="720px"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleCancel"
  >
    <t-upload
      v-model="files"
      accept=".json"
      theme="file-input"
      placeholder="请选择文件，仅支持json格式"
      :auto-upload="false"
    ></t-upload>
  </t-dialog>
</template>
<script lang="ts" setup>
import { useGlobalApi } from '@/composable/api'
import { MessagePlugin, type UploadProps } from 'tdesign-vue-next'
import { ref } from 'vue'
const emit = defineEmits(['refresh'])
const visible = ref<boolean>(false)
const files = ref<UploadProps['value']>([])

const handleOpen = () => {
  visible.value = true
}

const handleConfirm = async () => {
  if (!files.value?.length) {
    return MessagePlugin.error('请先选择要导入的文件')
  }

  try {
    const jsonData = await parseTextFile(files.value[0]?.raw as File)
    const { directories, categories, websites } = jsonData
    useGlobalApi()
      .importWebsiteData(directories, categories, websites)
      .then(res => {
        MessagePlugin.success('导入成功')
        handleCancel()
        emit('refresh')
      })
      .catch(error => {
        MessagePlugin.error('导入失败，请确认导入文件的数据是否正确')
      })
  } catch (error) {
    MessagePlugin.error(`导入失败: ${error || '未知错误'}`)
  }
}

/**
 * 解析文本文件（如 .json, .txt）
 */
const parseTextFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => {
      try {
        const content = e.target?.result as string
        // 将字符串解析为 JSON 对象
        const jsonData = JSON.parse(content)
        resolve(jsonData)
      } catch (err) {
        reject(new Error(`文件格式错误，无法解析为JSON: ${err}`))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))

    // 以文本格式读取文件
    reader.readAsText(file)
  })
}

const handleCancel = () => {
  visible.value = false
  files.value = []
}

defineExpose({
  handleOpen,
})
</script>
