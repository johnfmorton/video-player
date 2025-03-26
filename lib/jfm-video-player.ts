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
          <picture class="poster" tabindex="0" role="button" aria-label="Play video">
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
            posterHTML = `<img class="poster" src="${poster}" alt="${posterAlt}" tabindex="0" role="button" aria-label="Play video">`
        }

        const playButtonHTML = showPlayButton
            ? `<button class="play-button" aria-label="Play video"></button>`
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
          border: none;
          cursor: pointer;
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

        const clickTargets =
            this.shadowRoot!.querySelectorAll('[role="button"]')
        clickTargets.forEach((el) => {
            el?.addEventListener('click', () =>
                this._loadVideo({
                    src,
                    sources,
                    allowFullscreen,
                    autoplay: true,
                })
            )
            el?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    this._loadVideo({
                        src,
                        sources,
                        allowFullscreen,
                        autoplay: true,
                    })
                }
            })
        })

        if (!posterHTML) {
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
            }" frameborder="0" ${allowAttrs} ${fullscreenAttr} title="YouTube Video"></iframe>`
        } else if (/vimeo\.com/.test(src)) {
            const videoId = this._extractVimeoID(src)
            embedHTML = `<iframe src="https://player.vimeo.com/video/${videoId}${
                autoplay ? '?autoplay=1' : ''
            }" frameborder="0" ${allowAttrs} ${fullscreenAttr} title="Vimeo Video"></iframe>`
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
