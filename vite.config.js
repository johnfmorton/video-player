// This is the config file used to compile the module that will be published to NPM.
const path = require('path')
const { defineConfig } = require('vite')
import banner from 'vite-plugin-banner'
import pkg from './package.json'

// Now in UTC time. Format time as YYYY-MM-DDTHH:mm:ss.sssZ.
const now = new Date().toISOString()

module.exports = defineConfig({
    build: {
        lib: {
            entry: path.resolve(
                __dirname,
                'lib/vite-module-builder-w-ghpages-npm-template.ts'
            ),
            name: 'vite-module-builder-w-ghpages-npm-template',
            fileName: (format) =>
                `vite-module-builder-w-ghpages-npm-template.${format}.js`,
        },
        minify: false,
    },
    plugins: [
        banner(
            `/**\n * name: ${pkg.name}\n * version: v${pkg.version}\n * description: ${pkg.description}\n * author: ${pkg.author}\n * repository: ${pkg.repository.url}\n * build date: ${now} \n */`
        ),
    ],
})
