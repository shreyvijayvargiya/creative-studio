import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const isVercel = Boolean(process.env.VERCEL)

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    ...(process.env.NODE_ENV === 'development' ? [devtools()] : []),
    tailwindcss(),
    tanstackStart(),
    nitro(
      isVercel
        ? {
            preset: 'vercel',
            vercel: {
              entryFormat: 'node',
              functions: {
                runtime: 'nodejs22.x',
              },
            },
          }
        : undefined,
    ),
    viteReact(),
  ],
})
