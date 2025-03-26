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
        this.shadowRoot.innerHTML = `
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
        <div class="video-container hidden"></div>
      </div>
    `

        // Add click handler to show and play the video when the poster is clicked
        if (poster) {
            const posterImg = this.shadowRoot.querySelector('.poster')
            posterImg.addEventListener('click', () =>
                this._loadVideo(src, allowFullscreen)
            )
        } else {
            // If no poster is defined, load the video immediately
            this._loadVideo(src, allowFullscreen)
        }
    }

    // Loads the correct video type into the container and optionally starts playback
    _loadVideo(src, allowFullscreen) {
        const container = this.shadowRoot.querySelector('.video-container')
        if (!container) return

        let embedHTML = ''

        if (/youtube\.com|youtu\.be/.test(src)) {
            const videoId = this._extractYouTubeID(src)
            embedHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" ${
                allowFullscreen ? 'allowfullscreen' : ''
            } aria-label="YouTube Video"></iframe>`
        } else if (/vimeo\.com/.test(src)) {
            const videoId = this._extractVimeoID(src)
            embedHTML = `<iframe src="https://player.vimeo.com/video/${videoId}?autoplay=1" frameborder="0" ${
                allowFullscreen ? 'allowfullscreen' : ''
            } aria-label="Vimeo Video"></iframe>`
        } else {
            embedHTML = `<video src="${src}" autoplay controls aria-label="Self-hosted Video"></video>`
        }

        container.innerHTML = embedHTML
        container.classList.remove('hidden')

        const posterImg = this.shadowRoot.querySelector('.poster')
        if (posterImg) posterImg.classList.add('hidden')
    }

    _extractYouTubeID(url) {
        const regExp =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
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

export default VideoPlayer;

/**
 * USAGE:
 * <video-player src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" allowfullscreen aspect-ratio="16x9"></video-player>
 * <video-player src="https://vimeo.com/12345678" allowfullscreen aspect-ratio="4x3"></video-player>
 * <video-player src="/videos/my-video.mp4" poster="/images/poster.jpg" aspect-ratio="9x16"></video-player>
 *
 * Place this script in your HTML or import it via a <script type="module"> tag.
 */
