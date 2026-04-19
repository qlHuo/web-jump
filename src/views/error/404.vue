<template>
  <div class="h-dvh w-full flex items-center justify-center">
    <t-empty title="抱歉，您访问的页面不存在">
      <template #action>
        <t-button @click="goToIndex">返回首页</t-button>
      </template>
    </t-empty>
  </div>
</template>

<script lang="ts" setup>
const goToIndex = () => {
  console.log('go to index')
  location.href = '/'
}
</script>
