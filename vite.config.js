// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'
import banner from 'vite-plugin-banner'
import pkg from './package.json'

const now = new Date().toISOString()

export default defineConfig(({ command }) => ({
    publicDir: command === 'serve' ? 'public' : false, // Conditional publicDir
    build: {
        lib: {
            entry: path.resolve(__dirname, 'lib/video-player.ts'),
            name: 'video-player',
            formats: ['es'],
            fileName: (format) => `video-player.${format}.js`,
        },
        minify: false,
    },
    plugins: [
        banner(
            `/**\n * name: ${pkg.name}\n * version: v${pkg.version}\n * description: ${pkg.description}\n * author: ${pkg.author}\n * repository: ${pkg.repository.url}\n * build date: ${now}\n */`
        ),
    ],
}))
