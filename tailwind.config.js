/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './demo-page-assets/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [require('@tailwindcss/typography')],
}
