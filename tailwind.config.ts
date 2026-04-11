// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}', // ✅ 必须包含 .vue！
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
