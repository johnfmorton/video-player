export interface VideoPlayerProps {
  src: string
  poster?: string
  allowfullscreen?: boolean
  aspectRatio?: '16x9' | '4x3' | '1x1' | '9x16'
}

class VideoPlayer extends HTMLElement {
    // Observe changes to these attributes so we can re-render accordingly
    static get observedAttributes() {
        return ['src', 'poster', 'allowfullscreen', 'aspect-ratio']
    }

    constructor() {
        super()
        // Attach shadow DOM for encapsulation
        this.attachShadow({ mode: 'open' })
        this._render()
    }

    // Called whenever observed attributes are changed
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this._render()
        }
    }

    // Core rendering logic to determine media type and display the appropriate player
    _render() {
        const src = this.getAttribute('src') || ''
        const poster = this.getAttribute('poster') || ''
        const allowFullscreen = this.hasAttribute('allowfullscreen')
        const aspectRatio = this.getAttribute('aspect-ratio') || '16x9'

        // Common aspect ratios and their percentage-based padding
        const aspectRatios = {
            '16x9': 56.25,
            '4x3': 75,
            '1x1': 100,
            '9x16': 177.78,
        }

        // Determine padding for responsive ratio
        const paddingTop = aspectRatios[aspectRatio] || 56.25

        let embedHTML = ''

        // Handle YouTube embedding
        if (/youtube\.com|youtu\.be/.test(src)) {
            const videoId = this._extractYouTubeID(src)
            embedHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" ${
                allowFullscreen ? 'allowfullscreen' : ''
            } aria-label="YouTube Video"></iframe>`

            // Handle Vimeo embedding
        } else if (/vimeo\.com/.test(src)) {
            const videoId = this._extractVimeoID(src)
            embedHTML = `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" ${
                allowFullscreen ? 'allowfullscreen' : ''
            } aria-label="Vimeo Video"></iframe>`

            // Handle self-hosted video
        } else {
            embedHTML = `
        <video src="${src}" ${
                poster ? `poster="${poster}"` : ''
            } controls aria-label="Self-hosted Video">
          Your browser does not support the video tag.
        </video>`
        }

        // Apply styles and insert the video player markup
        this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 100%;
        }
        .video-wrapper {
          position: relative;
          width: 100%;
          padding-top: ${paddingTop}%;
        }
        iframe, video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      </style>
      <div class="video-wrapper">
        ${embedHTML}
      </div>
    `
    }

    // Extract the YouTube video ID from various YouTube URL formats
    _extractYouTubeID(url) {
        const regExp =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
        const match = url.match(regExp)
        return match ? match[1] : ''
    }

    // Extract the Vimeo video ID from a Vimeo URL
    _extractVimeoID(url) {
        const regExp = /vimeo\.com\/(?:video\/)?(\d+)/
        const match = url.match(regExp)
        return match ? match[1] : ''
    }
}

// Define the custom element
customElements.define('video-player', VideoPlayer)

/**
 * USAGE:
 * <video-player src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" allowfullscreen aspect-ratio="16x9"></video-player>
 * <video-player src="https://vimeo.com/12345678" allowfullscreen aspect-ratio="4x3"></video-player>
 * <video-player src="/videos/my-video.mp4" poster="/images/poster.jpg" aspect-ratio="9x16"></video-player>
 *
 * Place this script in your HTML or import it via a <script type="module"> tag.
 */

export default VideoPlayer;
