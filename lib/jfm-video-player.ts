/// <reference lib="dom" />

// If you have global YT or Vimeo APIs, declare them for TS:
// Alternatively, you can define them in a separate .d.ts file.
declare var YT: any
declare var Vimeo: any

export class VideoPlayer extends HTMLElement {
    private _playerType: 'self-hosted' | 'youtube' | 'vimeo' = 'self-hosted'

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
        this._playerType = 'self-hosted'
        this._render()
    }

    attributeChangedCallback(
        _name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        if (oldValue !== newValue) {
            this._render()
        }
    }

    private _emitEvent(eventName: string) {
        this.dispatchEvent(
            new CustomEvent(eventName, {
                detail: {
                    type: this._playerType,
                    src: this.getAttribute('src'),
                },
                bubbles: true,
                composed: true,
            })
        )
    }

    private _detectPlayerType(
        src: string
    ): 'youtube' | 'vimeo' | 'self-hosted' {
        if (/youtube\.com|youtu\.be/.test(src)) return 'youtube'
        if (/vimeo\.com/.test(src)) return 'vimeo'
        return 'self-hosted'
    }

    private _render() {
        const src = this.getAttribute('src') || ''
        const sources = this.hasAttribute('sources')
            ? this.getAttribute('sources')!
            : undefined

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

        const paddingTop =
            aspectRatios[aspectRatio as keyof typeof aspectRatios] || 56.25

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
            el?.addEventListener('click', () => {
                this._playerType = this._detectPlayerType(src)
                this._loadVideo({
                    src,
                    sources,
                    allowFullscreen: !!allowFullscreen,
                    autoplay: true,
                })
            })
        })

        if (!posterHTML) {
            this._playerType = this._detectPlayerType(src)
            this._emitEvent('video-load')
            this._loadVideo({
                src,
                sources,
                allowFullscreen: !!allowFullscreen,
                autoplay: false,
            })
        }
    }

    private _loadVideo({
        src,
        sources,
        allowFullscreen,
        autoplay,
    }: {
        src: string
        sources?: string
        allowFullscreen: boolean
        autoplay: boolean
    }) {
        const container = this.shadowRoot!.querySelector('.video-container')
        if (!container) return

        let embedHTML = ''
        const allowAttrs = `allow="${autoplay ? 'autoplay' : ''}"`
        const fullscreenAttr = allowFullscreen ? 'allowfullscreen' : ''

        // YouTube
        if (/youtube\.com|youtu\.be/.test(src)) {
            this._playerType = 'youtube'
            const videoId = this._extractYouTubeID(src)
            embedHTML = `<iframe id="ytPlayer" src="https://www.youtube.com/embed/${videoId}?enablejsapi=1${
                autoplay ? '&autoplay=1' : ''
            }" frameborder="0" ${allowAttrs} ${fullscreenAttr} title="YouTube Video"></iframe>`
            setTimeout(() => this._setupYouTubePlayer(), 500)
        }
        // Vimeo
        else if (/vimeo\.com/.test(src)) {
            this._playerType = 'vimeo'
            const videoId = this._extractVimeoID(src)
            embedHTML = `<iframe id="vimeoPlayer" src="https://player.vimeo.com/video/${videoId}?${
                autoplay ? 'autoplay=1' : ''
            }" frameborder="0" ${allowAttrs} ${fullscreenAttr} title="Vimeo Video"></iframe>`
            setTimeout(() => this._setupVimeoPlayer(), 500)
        }
        // Self-hosted
        else {
            this._playerType = 'self-hosted'
            let sourcesHTML = ''
            if (sources) {
                try {
                    const parsed: { src: string; type: string }[] =
                        JSON.parse(sources)
                    sourcesHTML = parsed
                        .map((s) => `<source src="${s.src}" type="${s.type}">`)
                        .join('\n')
                } catch (e) {
                    console.warn('Invalid JSON in sources attribute:', e)
                }
            }
            embedHTML = `<video id="selfHostedPlayer" ${
                autoplay ? 'autoplay' : ''
            } controls>
        ${sourcesHTML || `<source src="${src}" type="video/mp4">`}
        Your browser does not support the video tag.
      </video>`
            setTimeout(() => this._setupSelfHostedPlayer(), 500)
        }

        container.innerHTML = embedHTML
        container.classList.remove('hidden')

        const posterEl = this.shadowRoot!.querySelector('.poster')
        posterEl?.classList.add('hidden')
        const playBtn = this.shadowRoot!.querySelector('.play-button')
        playBtn?.classList.add('hidden')
    }

    private _setupYouTubePlayer() {
        const iframe = this.shadowRoot!.querySelector(
            '#ytPlayer'
        ) as HTMLIFrameElement
        if (!iframe) return

        new YT.Player(iframe, {
            events: {
                onStateChange: (event: any) => {
                    if (event.data === YT.PlayerState.PLAYING)
                        this._emitEvent('video-play')
                    if (event.data === YT.PlayerState.PAUSED)
                        this._emitEvent('video-pause')
                    if (event.data === YT.PlayerState.ENDED)
                        this._emitEvent('video-ended')
                },
            },
        })
    }

    private _vimeoPlayer: any
    private _setupVimeoPlayer() {
        const iframe = this.shadowRoot!.querySelector(
            '#vimeoPlayer'
        ) as HTMLIFrameElement
        if (!iframe) return

        if (this._vimeoPlayer) {
            this._vimeoPlayer.off('play')
            this._vimeoPlayer.off('pause')
            this._vimeoPlayer.off('ended')
        }

        this._vimeoPlayer = new Vimeo.Player(iframe)
        this._vimeoPlayer.on('play', () => this._emitEvent('video-play'))
        this._vimeoPlayer.on('pause', () => this._emitEvent('video-pause'))
        this._vimeoPlayer.on('ended', () => this._emitEvent('video-ended'))
    }

    private _setupSelfHostedPlayer() {
        const video = this.shadowRoot!.querySelector(
            '#selfHostedPlayer'
        ) as HTMLVideoElement
        if (!video) return

        // Prevent attaching duplicate listeners by checking for a custom attribute.
        if (video.getAttribute('data-listeners-attached') === 'true') return
        video.setAttribute('data-listeners-attached', 'true')

        video.addEventListener('play', () => this._emitEvent('video-play'))
        video.addEventListener('pause', () => this._emitEvent('video-pause'))
        video.addEventListener('ended', () => this._emitEvent('video-ended'))
    }

    private _extractYouTubeID(url: string): string {
        const regExp =
            /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url.match(regExp)
        return match ? match[1] : ''
    }

    private _extractVimeoID(url: string): string {
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
