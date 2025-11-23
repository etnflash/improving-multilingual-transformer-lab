import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = fileURLToPath(new URL('./', import.meta.url))
const htmlEntries = readdirSync(projectRoot)
  .filter((file) => file.endsWith('.html'))
  .reduce((entries, file) => {
    const name = file.replace(/\.html$/, '')
    entries[name] = resolve(projectRoot, file)
    return entries
  }, {})

if (!Object.keys(htmlEntries).length) {
  htmlEntries.index = resolve(projectRoot, 'index.html')
}

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      input: htmlEntries
    }
  }
})
