class VideoPlayer extends HTMLElement {
    static get observedAttributes() {
        return ['src', 'poster', 'allowfullscreen', 'aspect-ratio']
    }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this._render()
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this._render()
        }
    }

    _render() {
        const src = this.getAttribute('src') || ''
        const poster = this.getAttribute('poster') || ''
        const allowFullscreen = this.hasAttribute('allowfullscreen')
        const aspectRatio = this.getAttribute('aspect-ratio') || '16x9'

        const aspectRatios = {
            '16x9': 56.25,
            '4x3': 75,
            '1x1': 100,
            '9x16': 177.78,
        }

        const paddingTop = aspectRatios[aspectRatio] || 56.25

        // Build the wrapper and placeholder
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
        iframe, video, img.poster {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
        }
        .hidden {
          display: none;
        }
      </style>
      <div class="video-wrapper">
        ${
            poster
                ? `<img class="poster" src="${poster}" alt="Video preview image">`
                : ''
        }
        <div class="video-container ${poster ? 'hidden' : ''}"></div>
      </div>
    `

        // If poster exists, load video on click with autoplay
        if (poster) {
            const posterImg = this.shadowRoot!.querySelector('.poster')
            posterImg?.addEventListener('click', () =>
                this._loadVideo(src, allowFullscreen, true)
            )
        } else {
            // Load video immediately without autoplay
            this._loadVideo(src, allowFullscreen, false)
        }
    }

    /**
     * Loads the appropriate video player into the DOM.
     * @param {string} src - Video source URL
     * @param {boolean} allowFullscreen - Whether fullscreen is allowed
     * @param {boolean} autoplay - Whether to autoplay the video
     */
    _loadVideo(src, allowFullscreen, autoplay) {
        const container = this.shadowRoot!.querySelector('.video-container')
        if (!container) return

        let embedHTML = ''

        const allowAttrs = `allow="${autoplay ? 'autoplay' : ''}"`
        const fullscreenAttr = allowFullscreen ? 'allowfullscreen' : ''

        if (/youtube\.com|youtu\.be/.test(src)) {
            const videoId = this._extractYouTubeID(src)
            embedHTML = `<iframe src="https://www.youtube.com/embed/${videoId}${
                autoplay ? '?autoplay=1' : ''
            }" frameborder="0" ${allowAttrs} ${fullscreenAttr} aria-label="YouTube Video"></iframe>`
        } else if (/vimeo\.com/.test(src)) {
            const videoId = this._extractVimeoID(src)
            embedHTML = `<iframe src="https://player.vimeo.com/video/${videoId}${
                autoplay ? '?autoplay=1' : ''
            }" frameborder="0" ${allowAttrs} ${fullscreenAttr} aria-label="Vimeo Video"></iframe>`
        } else {
            embedHTML = `<video src="${src}" ${
                autoplay ? 'autoplay' : ''
            } controls aria-label="Self-hosted Video"></video>`
        }

        container.innerHTML = embedHTML
        container.classList.remove('hidden')

        const posterImg = this.shadowRoot!.querySelector('.poster')
        posterImg?.classList.add('hidden')
    }

    _extractYouTubeID(url) {
        // Support standard, short, embed, and shorts YouTube URLs
        const regExp =
            /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([^"&?/\s]{11})/
        const match = url.match(regExp)
        return match ? match[1] : ''
    }

    _extractVimeoID(url) {
        const regExp = /vimeo\.com\/(?:video\/)?(\d+)/
        const match = url.match(regExp)
        return match ? match[1] : ''
    }
}

customElements.define('video-player', VideoPlayer)

export default VideoPlayer

/**
 * USAGE:
 * <video-player src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" allowfullscreen aspect-ratio="16x9"></video-player>
 * <video-player src="https://youtube.com/shorts/ZqxIQa4yjII" allowfullscreen aspect-ratio="9x16"></video-player>
 * <video-player src="https://vimeo.com/12345678" allowfullscreen aspect-ratio="4x3"></video-player>
 * <video-player src="/videos/my-video.mp4" poster="/images/poster.jpg" aspect-ratio="9x16"></video-player>
 *
 * Place this script in your HTML or import it via a <script type="module"> tag.
 */
