import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const injectEnvPlugin = (mode) => ({
  name: 'inject-env-background',
  closeBundle() {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    const src = resolve(__dirname, 'public', 'background.js')
    const dest = resolve(__dirname, 'dist', 'background.js')

    let content = readFileSync(src, 'utf-8')
    content = content.replace(
      '__BACKEND_URL__',
      env.VITE_BACKEND_URL || 'http://localhost:8000'
    )
    writeFileSync(dest, content, 'utf-8')
    console.log(`✓ background.js injected with BACKEND_URL=${env.VITE_BACKEND_URL}`)
  },
})

export default defineConfig(({ mode }) => ({
  plugins: [react(), injectEnvPlugin(mode)],
  define: {
    'process.env': {}
  }
}))