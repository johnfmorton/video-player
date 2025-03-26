export class VideoPlayer extends HTMLElement {
    static get observedAttributes() {
        return [
            'src',
            'sources',
            'poster',
            'posters',
            'posteralt',
            'playbutton',
            'allowfullscreen',
            'aspect-ratio',
            'autosize',
        ]
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
        const sources = this.getAttribute('sources')
        const poster = this.getAttribute('poster') || ''
        const posters = this.getAttribute('posters')
        const posterAlt =
            this.getAttribute('posteralt') || 'Video preview image'
        const showPlayButton = this.hasAttribute('playbutton')
        const allowFullscreen = this.hasAttribute('allowfullscreen')
        const autosize = this.hasAttribute('autosize')
        const aspectRatio = this.getAttribute('aspect-ratio') || '16x9'

        const aspectRatios = {
            '16x9': 56.25,
            '4x3': 75,
            '1x1': 100,
            '9x16': 177.78,
        }

        const paddingTop = aspectRatios[aspectRatio] || 56.25

        let posterHTML = ''
        if (posters) {
            try {
                const parsed = JSON.parse(posters)
                const fallback = parsed.jpg || parsed.png || ''
                posterHTML = `
          <picture class="poster">
            ${
                parsed.avif
                    ? `<source type="image/avif" srcset="${parsed.avif}">`
                    : ''
            }
            ${
                parsed.webp
                    ? `<source type="image/webp" srcset="${parsed.webp}">`
                    : ''
            }
            ${
                parsed.jpg
                    ? `<source type="image/jpeg" srcset="${parsed.jpg}">`
                    : ''
            }
            ${
                parsed.png
                    ? `<source type="image/png" srcset="${parsed.png}">`
                    : ''
            }
            <img class="poster" src="${fallback}" alt="${posterAlt}">
          </picture>`
            } catch (e) {
                console.warn('Invalid JSON in posters attribute:', e)
            }
        } else if (poster) {
            posterHTML = `<img class="poster" src="${poster}" alt="${posterAlt}">`
        }

        const playButtonHTML = showPlayButton
            ? `<div class="play-button" role="button" aria-label="Play video"></div>`
            : ''

        this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          ${autosize ? 'width: 100%;' : ''}
        }
        .video-wrapper {
          position: relative;
          width: 100%;
          padding-top: ${paddingTop}%;
        }
        iframe, video, .poster {
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
        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: var(--play-button-bg, rgba(255, 255, 255, 0.8));
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: background 0.3s, box-shadow 0.3s;
        }
        .play-button::before {
          content: '';
          display: block;
          width: 0;
          height: 0;
          margin-left: 2px;
          border-left: 18px solid var(--play-button-arrow, #000);
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
        }
        .play-button:hover {
          background: var(--play-button-bg-hover, rgba(255, 255, 255, 1));
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
      </style>
      <div class="video-wrapper">
        ${posterHTML}
        ${playButtonHTML}
        <div class="video-container ${posterHTML ? 'hidden' : ''}"></div>
      </div>
    `

        if (posterHTML) {
            const clickTargets = this.shadowRoot!.querySelectorAll(
                '.poster, .play-button'
            )
            clickTargets.forEach((el) => {
                el?.addEventListener('click', () =>
                    this._loadVideo({
                        src,
                        sources,
                        allowFullscreen,
                        autoplay: true,
                    })
                )
            })
        } else {
            this._loadVideo({ src, sources, allowFullscreen, autoplay: false })
        }
    }

    _loadVideo({ src, sources, allowFullscreen, autoplay }) {
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
            let sourcesHTML = ''
            if (sources) {
                try {
                    const parsed = JSON.parse(sources)
                    sourcesHTML = parsed
                        .map((s) => `<source src="${s.src}" type="${s.type}">`)
                        .join('\n')
                } catch (e) {
                    console.warn('Invalid JSON in sources attribute:', e)
                }
            }

            embedHTML = `<video ${
                autoplay ? 'autoplay' : ''
            } controls aria-label="Self-hosted Video">
        ${sourcesHTML || `<source src="${src}" type="video/mp4">`}
        Your browser does not support the video tag.
      </video>`
        }

        container.innerHTML = embedHTML
        container.classList.remove('hidden')

        const posterEl = this.shadowRoot!.querySelector('.poster')
        posterEl?.classList.add('hidden')

        const playBtn = this.shadowRoot!.querySelector('.play-button')
        playBtn?.classList.add('hidden')
    }

    _extractYouTubeID(url) {
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

export function registerVideoPlayer(tagName = 'video-player') {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, VideoPlayer)
    }
}

export default VideoPlayer

/**
 * USAGE:
 *
 * YouTube:
 * <video-player
 *   src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *   posters='{
 *     "webp": "/cms/poster.webp",
 *     "png": "/cms/poster.png"
 *   }'
 *   posteralt="Watch this cool video"
 *   playbutton
 *   autosize
 *   allowfullscreen
 *   aspect-ratio="16x9">
 * </video-player>
 *
 * Vimeo:
 * <video-player
 *   src="https://vimeo.com/12345678"
 *   posters='{
 *     "png": "/cms/poster.png"
 *   }'
 *   playbutton
 *   autosize
 *   allowfullscreen
 *   aspect-ratio="4x3">
 * </video-player>
 *
 * Self-hosted:
 * <video-player
 *   sources='[
 *     { "src": "/videos/video.webm", "type": "video/webm" },
 *     { "src": "/videos/video.mp4", "type": "video/mp4" }
 *   ]'
 *   posters='{
 *     "avif": "/images/poster.avif",
 *     "jpg": "/images/poster.jpg"
 *   }'
 *   posteralt="Preview frame for custom video"
 *   playbutton
 *   autosize
 *   aspect-ratio="9x16">
 * </video-player>
 *
 * Include this script in your HTML or import it via a <script type="module"> tag.
 */
