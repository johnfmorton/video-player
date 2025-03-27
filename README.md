# `<video-player>` Web Component

A fully customizable and responsive Web Component that supports:

- YouTube videos (including Shorts)
- Vimeo videos
- Self-hosted videos (MP4, WebM, etc.)
- Poster images in AVIF, WebP, JPG, PNG
- Optional fullscreen, custom play button, and auto-sizing

---

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

## 📄 License
MIT

---

## ✨ Credits
Created by John F Morton. Contributions welcome!
