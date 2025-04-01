# `<video-player>` Web Component

A fully customizable and responsive Web Component that supports:

- YouTube videos (including Shorts)
- Vimeo videos
- Self-hosted videos (MP4, WebM, etc.)
- Poster images in AVIF, WebP, JPG, PNG
- Optional fullscreen, custom play button, and auto-sizing

## Home page and demo

The home page for this project is at [https://github.com/johnfmorton/video-player](https://github.com/johnfmorton/video-player) where you will find the source code.

You can view a working demo of this component at [https://johnfmorton.github.io/video-player/](https://johnfmorton.github.io/video-player/).

## Why?

This web-component was built because I needed a video player that could handle YouTube, Vimeo, and self-hosted videos. The project required being able to have custom poster frames which would load the video player upon click.

I also wanted a self-contained component with a simple API that would allow me to easily add videos to my projects without having to worry about the underlying implementation details.

This is the result.

---

## Installation

### Using a package manager

#### npm


The `video-player` component is available via npm at [https://www.npmjs.com/package/@morton-studio/video-player](https://www.npmjs.com/package/@morton-studio/video-player).

Install it with npm:

```sh
npm install @morton-studio/video-player
```

Next, import and register the component in your JavaScript file. Note that you can register the component with a custom tag name when using npm.

```js
import { registerVideoPlayer } from '@morton-studio/video-player'
registerVideoPlayer()

// If you want to customize the tag name, pass in a string:
// registerVideoPlayer('my-video-player')
```

### CDN

If you prefer not to use npm, you can include the component directly in your HTML file. This will load the latest version from a CDN and register the component automatically.

#### jsDelivr

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@morton-studio/video-player@latest/dist/video-player.es.js"></script>
```

#### unpkg

```html
<script type="module" src="https://unpkg.com/@morton-studio/video-player@latest/dist/video-player.es.js"></script>
```

If you are using the CDN version, you don't need to do anything else. The component will be registered automatically using the default tag name `<video-player>` in your HTML.

## Usage

Then use it in your HTML:

```html
<video-player src="video.mp4"></video-player>
```

### Optional: Install the YouTube API and Vimeo API

You may include the YouTube and Vimeo APIs in your HTML file if you want to use their features directly in other parts of your application.

This is optional, as the component will automatically load them if needed by looking on the Window object for `YT` or `Vimeo`. If either API is not required, the component will not load them. For example, if you have no Vimeo URLs in `video-player` components on your page, the Vimeo API will not be loaded.

```html
<!-- YouTube iFrame API, if needed -->
<script src="https://www.youtube.com/iframe_api"></script>
<!-- Vimeo API, if needed -->
<script src="https://player.vimeo.com/api/player.js"></script>
```

## 🚀 Features

### ✅ Smart Video Source Detection

Automatically determines video type based on the `src` URL:

- YouTube URLs (incl. Shorts): `https://www.youtube.com/watch?v=...`, `https://youtu.be/...`, `https://youtube.com/shorts/...`
- Vimeo: `https://vimeo.com/...`
- Self-hosted: anything else (assumes direct video file)

### ✅ Responsive Aspect Ratios

Supports predefined aspect ratios:

- `16x9` (default)
- `4x3`
- `1x1`
- `9x16`

Use the `aspect-ratio` attribute:

```html
<video-player aspect-ratio="4x3"></video-player>
```

### ✅ Poster Image Support

Use a single image:

```html
<video-player poster="/images/poster.jpg"></video-player>
```

Or use multiple formats:

```html
<video-player posters='{
  "avif": "/images/poster.avif",
  "webp": "/images/poster.webp",
  "jpg": "/images/poster.jpg",
  "png": "/images/poster.png"
}'></video-player>
```

### ✅ Custom Alt Text for Poster

Use the `posteralt` attribute to improve accessibility:

```html
<video-player posteralt="Preview image for demo clip"></video-player>
```

### ✅ Optional Play Button Overlay

Adds a centered play icon on the poster frame:

```html
<video-player playbutton></video-player>
```

### ✅ Fullscreen Toggle Support

Use the `allowfullscreen` attribute:

```html
<video-player allowfullscreen></video-player>
```

### ✅ Normalized Events

The <video-player> component normalizes events across different video player implementations, ensuring a unified experience. Supported events include:

* `video-play`
* `video-pause`
* `video-ended`

Each event is dispatched with a `detail` object containing the following properties:

- `type`: The type of video service (e.g., `youtube`, `vimeo`, `self-hosted`).
- `src`: The source URL of the video.
- `currentTime`: The current playback time in seconds, if available.
- `duration`: The total duration of the video in seconds, if available.

This allows developers to handle events consistently, regardless of the underlying video player technology.

### ✅ Flexible Layout with `autosize`

Make the component stretch to fill its container:

```html
<video-player autosize></video-player>
```

This is useful inside `flex` or `grid` layouts.

---

## 🎨 Custom Styles

You can customize the appearance of the play button using CSS variables:

```css
video-player {
  --play-button-bg: rgba(0, 0, 0, 0.7);        /* Button background */
  --play-button-arrow: white;                 /* Triangle color */
  --play-button-bg-hover: rgba(0, 0, 0, 0.9);  /* Background on hover */
}
```

These variables let you customize the style without modifying the component directly.

---

## ♿ Accessibility

This component has built-in accessibility features:

- Poster images have customizable `alt` text.
- All clickable elements (poster, play button) are keyboard accessible via `Enter` and `Space` keys.
- The poster is focusable and labeled with `role="button"` and `aria-label`.
- Uses semantic `<button>` for the play overlay.
- `iframe` embeds include a `title` attribute for screen reader clarity.

---

## 📦 Self-Hosted Video with Multiple Formats

Use the `sources` attribute (as a JSON string):

```html
<video-player sources='[
  { "src": "/video.mp4", "type": "video/mp4" },
  { "src": "/video.webm", "type": "video/webm" }
]'></video-player>
```

---

## 🧩 Examples

### YouTube (with posters and play button)

```html
<video-player
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  posters='{
    "webp": "/images/poster.webp",
    "png": "/images/poster.png"
  }'
  posteralt="Preview frame for YouTube video"
  playbutton
  allowfullscreen
  aspect-ratio="16x9">
</video-player>
```

### Self-Hosted Video with Multiple Formats

```html
<video-player
  sources='[
    { "src": "/video.mp4", "type": "video/mp4" },
    { "src": "/video.webm", "type": "video/webm" }
  ]'
  posters='{
    "avif": "/images/poster.avif",
    "jpg": "/images/poster.jpg"
  }'
  posteralt="Preview frame for self-hosted video"
  playbutton
  allowfullscreen
  autosize
  aspect-ratio="9x16">
</video-player>
```

---

## 🛠 Installation

Include the JS file via `<script type="module">` or package it into your build system.

```html
<script type="module" src="/path/to/video-player.js"></script>
```

Or import and register manually:

```js
import VideoPlayer, { registerVideoPlayer } from './video-player.js';
registerVideoPlayer();
```

You can also customize the tag name:

```js
registerVideoPlayer('my-video-player');
```

---

## 🧪 Development

- Written in plain TypeScript but compiles to ES6 for compatibility.
- Uses Shadow DOM
- No external dependencies
- Easily extensible for subtitles, controls, etc.

---

## 👷 Changelog

All notable changes to this project will be documented in the [CHANGELOG.md](CHANGELOG.md) file.

---

## 📄 License
MIT

---

## ✨ Credits
Created by John F Morton. Contributions welcome!
