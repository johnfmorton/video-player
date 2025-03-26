// This is the config file used to compile demo site that will be published to GitHub Pages.
import { defineConfig } from 'vite'

export default defineConfig({
    base: 'https://johnfmorton.github.io/vite-module-builder-w-ghpages-npm-template/', // Set this to the GitHub Pages URL, i.e., https://<USERNAME>.github.io/<REPO>/.
    build: {
        outDir: 'demo', // This is directory where the demo site will be built. It will be published to GitHub Pages. It is not the same as the directory where the module will be built. It also is in the .gitignore file so you will not see it in the repo.
        minify: true,
    },
})
