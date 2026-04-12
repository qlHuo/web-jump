<template>
  <t-dialog
    header="推送数据"
    v-model:visible="visible"
    width="720px"
    :confirmBtn="{
      loading: confirmLoading,
    }"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleCancel"
  >
    <t-form labelAlign="top" :data="formData" :rules="rules" ref="formRef">
      <t-form-item label="授权码" name="auth">
        <t-input v-model="formData.auth" placeholder="请输入授权码"></t-input>
      </t-form-item>
      <t-form-item name="version">
        <template #label>
          <span>升级版本</span>
          <span class="text-xs ml-2 text-gray-500"
            >当前版本: <span class="text-[var(--td-brand-color)]"> {{ latestVersion }}</span
            >, 版本格式为：1.0.0</span
          >
        </template>
        <div class="flex items-center w-full">
          <span class="mr-1">V</span>
          <t-input class="flex-1" v-model="formData.version" placeholder="请输入数据版本，版本格式为：1.0.0"></t-input>
        </div>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { compareVersions, uuid } from '@/utils'
import type { Version } from '@/db/models'
import { useCategoryApi, useDirectoryApi, useWebsiteApi, useWorkerApi } from '@/composable/api'
import { MessagePlugin } from 'tdesign-vue-next'

const visible = ref<boolean>(false)
const formRef = ref()
const formData = ref<{ auth: string; version: string }>({
  auth: '',
  version: '',
})
const allVersions = ref<Array<Version>>([])
const confirmLoading = ref<boolean>(false)

// TODO:: 版本号对比规则待定
const rules = computed(() => {
  return {
    auth: [{ required: true, message: '请输入授权码' }],
    version: [
      { required: true, message: '请输入版本号' },
      {
        validator: (value: string) => {
          const versionReg = /^[0-9]+(\.[0-9]+){2}$/
          // 1-大于 0-等于 -1-小于
          const res = compareVersions(value, latestVersion.value)
          if (!versionReg.test(value)) {
            return { result: false, message: '请输入正确的版本号' }
          } else if (res !== 1) {
            return { result: false, message: '请输入大于当前版本的版本号' }
          }
          return { result: true }
        },
      },
    ],
  }
})

// 最新版本信息
const latestVersion = computed(() => {
  return allVersions.value[0]?.version || '0.0.0'
})

const handleOpen = async () => {
  visible.value = true
  const storageAuth = localStorage.getItem('remote-auth') || ''
  if (storageAuth) {
    formData.value.auth = storageAuth
  }
  getAllRemoteVersions()
}

// 获取所有远程版本信息
const getAllRemoteVersions = async () => {
  useWorkerApi()
    .getRemoteAllVersions()
    .then(res => {
      if (res.success) {
        allVersions.value = res?.data || []
      } else {
        MessagePlugin.error(res?.message || '获取版本信息失败')
        allVersions.value = []
      }
    })
    .catch(err => {
      MessagePlugin.error(err || '获取版本信息失败')
    })
}

const handleConfirm = async () => {
  const valid = await formRef.value.validate()
  if (typeof valid !== 'boolean' || !valid) return

  confirmLoading.value = true
  const { version, auth } = formData.value
  const versions = [
    {
      version,
      id: uuid(),
      createAt: new Date(),
    },
    ...allVersions.value,
  ]

  const directory = (await useDirectoryApi().getAll()) || []
  const categories = (await useCategoryApi().getAll()) || []
  const websites = (await useWebsiteApi().getAll()) || []

  useWorkerApi()
    .pushWebsiteDataToGithub(auth, { directory, categories, websites, versions })
    .then(res => {
      if (res.success) {
        localStorage.setItem('remote-auth', auth)
        MessagePlugin.success('推送成功')
        handleCancel()
      } else {
        MessagePlugin.error(res.message || '推送失败')
      }
      confirmLoading.value = false
    })
    .catch(err => {
      confirmLoading.value = false
      MessagePlugin.error(err || '推送失败')
    })
}

const handleCancel = () => {
  visible.value = false
  formRef.value.reset()
}

defineExpose({
  handleOpen,
})
</script>

<style scoped lang="less"></style>
