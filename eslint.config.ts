import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginVueScopedCss from 'eslint-plugin-vue-scoped-css' // 👈

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  skipFormatting,
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }]
    }
  },

  {
    plugins: {
      'vue-scoped-css': pluginVueScopedCss
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue-scoped-css/enforce-style-type': ['error', { allows: ['module'] }],
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }
)
