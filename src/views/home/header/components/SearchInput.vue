<template>
  <div class="w-full">
    <t-input
      class="search-input"
      clearable
      :placeholder="selectedEngine.placeholder"
      @enter="handleSearch"
      @blur="visible = false"
    >
      <template #prefixIcon>
        <t-popup
          showArrow
          trigger="click"
          overlayInnerClassName="w-full !p-4 max-h-50 overflow-auto"
          :overlayStyle="{
            width: 'calc(100vw - 32px)',
            maxWidth: '600px',
          }"
          placement="bottom-left"
          :delay="[0, 0]"
          :visible="visible"
        >
          <template #content>
            <div class="w-full h-full overflow-auto">
              <div class="flex items-center flex-wrap gap-2">
                <div
                  v-for="engine in searchEngines"
                  :key="engine.value"
                  class="h-18 w-18 flex flex-col items-center gap-2 cursor-pointer hover:bg-[var(--td-gray-color-2)] p-2 rounded"
                  @click="handleSearchEngineSelect(engine)"
                >
                  <img
                    :src="engine.icon"
                    alt=""
                    class="w-8 h-8 rounded-sm object-cover"
                  />
                  <span>{{ engine.name }}</span>
                </div>
              </div>
            </div>
          </template>
          <div
            class="h-full flex justify-between items-center pl-2 pr-2 cursor-pointer"
            @click="visible = !visible"
          >
            <img
              :src="selectedEngine.icon"
              alt=""
              class="w-6 h-6 rounded-sm object-cover mr-1"
            />
            <HiIcon name="icon-arrow-down" size="12px" class="text-gray-400" />
          </div>
        </t-popup>
      </template>
    </t-input>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref<boolean>(false)

type SearchEngine = {
  name: string
  value: string
  icon: string
  url: string
  placeholder?: string
}
const searchEngines = ref<SearchEngine[]>([
  {
    name: '本站',
    value: 'local',
    icon: 'http://localhost:5173/src/assets/logo.svg',
    url: 'https://localhost:5173/?q=',
    placeholder: '搜索本站内容...',
  },
  {
    name: '必应',
    value: 'bing',
    icon: 'https://www.bing.com/sa/simg/bing_p_rr_teal_min.ico',
    url: 'https://www.bing.com/search?q=',
    placeholder: '搜索必应内容...',
  },
  {
    name: '百度',
    value: 'baidu',
    icon: 'https://www.baidu.com/favicon.ico',
    url: 'https://www.baidu.com/s?wd=',
    placeholder: '百度一下，你就知道...',
  },
  {
    name: '谷歌',
    value: 'google',
    icon: 'https://ts1.tc.mm.bing.net/th/id/ODF.cQGDzDdW-31GYqwCeCzTrw?w=32&h=32&qlt=90&pcl=fffffc&o=6&pid=1.2',
    url: 'https://www.google.com/search?q=',
    placeholder: '搜索谷歌内容...',
  },
  {
    name: 'GitHub',
    value: 'github',
    icon: 'https://github.githubassets.com/favicons/favicon.png',
    url: 'https://github.com/search?q=',
    placeholder: '搜索GitHub内容...',
  },
  {
    name: '知乎',
    value: 'zhihu',
    icon: 'https://www.zhihu.com/favicon.ico',
    url: 'https://www.zhihu.com/search?type=content&q=',
    placeholder: '有问题？上知乎！',
  },
])

const selectedEngine = ref<SearchEngine>(searchEngines.value[0]!)
const handleSearchEngineSelect = (engine: SearchEngine) => {
  selectedEngine.value = engine
  visible.value = false
  // 在这里可以根据选择的搜索引擎进行相应的处理，例如更新输入框的占位符或执行搜索
}

const handleSearch = (value: string) => {
  if (!value) return
  const searchUrl = `${selectedEngine.value.url}${encodeURIComponent(value)}`
  window.open(searchUrl, '_blank')
}
</script>

<style scoped lang="less">
.search-input {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;

  &:focus-visible {
    outline: unset;
  }
  :deep(.t-input.t-input--prefix) {
    padding: 0 8px 0 0;
    height: 48px;
    line-height: 48px;
  }

  :deep(.t-input) {
    transition: unset;
    border: unset;
    &:focus,
    &:hover,
    &:focus-within,
    &--focused {
      box-shadow: none;
      border: none;
      z-index: unset;
      transition: unset;
    }
  }
  :deep(.t-is-focused) {
    box-shadow: none;
    border: none;
    z-index: unset;
  }
}
</style>
