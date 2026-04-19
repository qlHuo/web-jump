// eslint.config.ts
import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from 'eslint-config-prettier/flat'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,tsx,mts,cts}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  // Vue 基础配置
  ...pluginVue.configs['flat/essential'],
  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  // Vue 文件配置 - 支持 JSX
  {
    name: 'vue-files',
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
        jsxPragma: 'h',
        jsxFragmentName: 'Fragment',
        jsxImportSource: 'vue',
        project: ['./tsconfig.json'],
      },
    },
    rules: {
      // Vue 自定义规则
      'vue/multi-word-component-names': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/component-definition-name-casing': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-unused-vars': 'error',
      'vue/valid-v-on': 'error',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/script-setup-uses-vars': 'error',
      'vue/no-deprecated-v-bind-sync': 'error',
      'vue/no-deprecated-slot-attribute': 'error',
      'vue/no-deprecated-filter': 'error',
      'vue/no-deprecated-v-on-native-modifier': 'error',
    },
  },

  // TSX 文件配置
  {
    name: 'tsx-files',
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
        jsxPragma: 'h',
        jsxFragmentName: 'Fragment',
        jsxImportSource: 'vue', // 关键：指定 Vue 作为 JSX 导入源
        project: ['./tsconfig.json'],
      },
    },
    rules: {
      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-use-before-define': 'off',
      // TSX 特定规则
      '@typescript-eslint/no-restricted-syntax': [
        'error',
        {
          selector: 'TSTypeAssertion, TSAsExpression',
          message: 'Type assertions are not allowed.',
        },
      ],
    },
  },

  // 通用规则
  {
    name: 'general-rules',
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
    languageOptions: {
      globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        h: 'readonly',
        Fragment: 'readonly',
      },
    },
  },

  skipFormatting
)
