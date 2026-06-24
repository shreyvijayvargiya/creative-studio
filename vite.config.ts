import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    ...(process.env.NODE_ENV === 'development' ? [devtools()] : []),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
})
