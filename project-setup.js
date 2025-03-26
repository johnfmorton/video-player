const readline = require('readline')
const fs = require('fs')
const url = require('url')
const path = require('path')

const colours = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',

    fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m',
        crimson: '\x1b[38m', // Scarlet
    },
    bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
        gray: '\x1b[100m',
        crimson: '\x1b[48m',
    },
}

const REPLACE_ME = 'vite-module-builder-w-ghpages-npm-template'
const GIT_URL =
    'https://github.com/johnfmorton/vite-module-builder-w-ghpages-npm-template'

// Array of file paths to search and replace
const files = [
    'index.html',
    'package.json',
    'README.md',
    'vite.config.js',
    'vite.demo.config.js',
    'demo-page-assets/demo.ts',
    // 'lib/vite-module-builder-w-ghpages-npm-template.ts',
]

// Create a readline interface to prompt the user for input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

// Define a function to validate the replacement text
function validateReplacementText(replacementText) {
    // Check if the replacement text is lowercase
    if (replacementText !== replacementText.toLowerCase()) {
        console.log(
            colours.bg.red +
                colours.fg.white +
                'ERROR: Replacement text must be lowercase.'
        )
        return false
    }

    // Check if the replacement text contains any spaces
    if (replacementText.includes(' ')) {
        console.log(
            colours.bg.red +
                colours.fg.white +
                'ERROR: Replacement text cannot contain spaces.'
        )
        return false
    }

    // Check if the replacement text includes at least one hyphen
    if (!replacementText.includes('-')) {
        console.log(
            colours.bg.red +
                colours.fg.white +
                'ERROR: Replacement text must include at least one hyphen.'
        )
        return false
    }

    // Check if the replacement text starts with a letter
    if (!/^[a-z]/.test(replacementText)) {
        console.log(
            colours.bg.red +
                colours.fg.white +
                'ERROR: Replacement text must start with a letter.'
        )
        return false
    }

    // If all validation checks pass, return true
    return true
}

// Define a function to validate the Git repo URL
function validateGitRepoUrl(gitRepoUrl) {
    // Parse the URL using Node.js' built-in `url` module
    const parsedUrl = url.parse(gitRepoUrl)

    // Check if the protocol is `http` or `https`
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        console.log(
            colours.bg.red +
                colours.fg.white +
                'ERROR: Invalid Git repo URL: must use HTTP or HTTPS protocol.'
        )
        return false
    }

    // Check if the hostname is present
    if (!parsedUrl.hostname) {
        console.log(
            colours.bg.red +
                colours.fg.white +
                'ERROR: Invalid Git repo URL: missing hostname.'
        )
        return false
    }

    // If all validation checks pass, return true
    return true
}

// Prompt the user for the replacement text
rl.question(
    'Enter your projet name: (lowercase, no spaces, at least one hyphen, may include numbers, must start with a letter): ',
    (replacementText) => {
        // Validate the replacement text
        const valid1 = validateReplacementText(replacementText)
        if (!valid1) {
            // If the validation fails, close the readline interface and exit
            rl.close()
            process.exitCode = 1
            return
        }

        // Prompt the user for the Git repo URL
        rl.question('Enter your Git repo URL: ', (gitRepoUrl) => {
            // Validate the Git repo URL
            const valid2 = validateGitRepoUrl(gitRepoUrl)
            if (!valid2) {
                // If the validation fails, close the readline interface and exit
                rl.close()
                process.exitCode = 1
                return
            }

            // Loop through each file in the files array
            files.forEach((file) => {
                // Read the contents of the file
                const content = fs.readFileSync(file, 'utf8')

                // create a regex to match the replacement text
                const fileNameRegex = new RegExp(REPLACE_ME, 'g')

                const gitRepoRegex = new RegExp(GIT_URL, 'g')

                // Replace all instances of 'REPLACE_ME' with the user-supplied replacement text
                const updatedContent = content.replace(
                    fileNameRegex,
                    replacementText
                )

                // Replace all instances of 'GIT_URL' with the user-supplied Git repo URL
                const finalContent = updatedContent.replace(
                    gitRepoRegex,
                    gitRepoUrl
                )

                // Write the final content back to the file
                fs.writeFileSync(file, finalContent, 'utf8')

                // Log a message indicating the file was updated
                console.log(
                    colours.bg.green,
                    colours.fg.white,
                    `Updated ${file} `
                )
            })

            // Close the readline interface
            rl.close()

            const fileDirecotry = 'lib/'
            const fileToRename = `${REPLACE_ME}.ts` // the file to rename
            const extname = path.extname(fileToRename)
            const oldFilePath = path.join(fileDirecotry, fileToRename) // create the old file path
            const newFilePath = path.join(
                fileDirecotry,
                replacementText + extname
            ) // create the new file path with the new filename and same extension

            fs.rename(oldFilePath, newFilePath, function (err) {
                if (err) throw err
                // console.log('File renamed successfully!')
                rl.close()
            })
            const successMessage = `
****************************************************
* Setup complete. Happy coding!                    *
* To get started, run the following command:       *
*                                                  *
* npm run dev                                      *
*                                                  *
****************************************************
`
            console.log('')
            // Log a message indicating the setup is complete
            console.log(colours.bg.blue + colours.fg.white + successMessage)
        })
    }
)
