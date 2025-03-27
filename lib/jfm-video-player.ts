/// <reference lib="dom" />

// If you have global YT or Vimeo APIs, declare them for TS:
// Alternatively, define them in a separate .d.ts file.
declare var YT: any
declare var Vimeo: any

export class VideoPlayer extends HTMLElement {
    private _playerType: 'self-hosted' | 'youtube' | 'vimeo' = 'self-hosted'
    private _ytPlayer: any
    private _vimeoPlayer: any

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
        // Removed tabindex on host to avoid extra tab stops.
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

    // Converts an aspect ratio string like "16x9" into CSS format "16 / 9"
    private _getCssAspectRatio(aspect: string): string {
        const parts = aspect.split('x')
        if (
            parts.length === 2 &&
            !isNaN(Number(parts[0])) &&
            !isNaN(Number(parts[1]))
        ) {
            return `${parts[0]} / ${parts[1]}`
        }
        return '16 / 9'
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

        // Get CSS aspect ratio for poster element
        const cssAspectRatio = this._getCssAspectRatio(aspectRatio)

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
            <img class="poster" src="${fallback}" alt="${posterAlt}" style="aspect-ratio: ${cssAspectRatio};">
          </picture>`
            } catch (e) {
                console.warn('Invalid JSON in posters attribute:', e)
            }
        } else if (poster) {
            posterHTML = `<img class="poster" src="${poster}" alt="${posterAlt}" tabindex="0" role="button" aria-label="Play video" style="aspect-ratio: ${cssAspectRatio};">`
        }

        const playButtonHTML = showPlayButton
            ? `<button class="play-button" aria-label="Play video"></button>`
            : ''

        this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          ${autosize ? 'width: 100%;' : ''}
          --play-button-bg: rgba(255, 255, 255, 0.8);
          --play-button-bg-hover: rgba(255, 255, 255, 1);
          --play-button-arrow: #000;
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
        .poster, .poster img {
          aspect-ratio: ${cssAspectRatio};
        }
        .hidden {
          display: none;
        }
        /* Play Button Styles */
        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: var(--play-button-bg);
          border: none;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: background 0.3s, box-shadow 0.3s;
          pointer-events: none;
        }
        .play-button::before {
          content: '';
          display: block;
          width: 0;
          height: 0;
          margin-left: 2px; /* Nudge right for visual centering */
          border-left: 18px solid var(--play-button-arrow);
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
        }
        .video-wrapper:hover .play-button {
          background: var(--play-button-bg-hover);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
      </style>
      <div class="video-wrapper">
        ${posterHTML}
        ${playButtonHTML}
        <div class="video-container ${posterHTML ? 'hidden' : ''}"></div>
      </div>
    `

        // Attach click and keydown listeners to interactive elements
        const clickTargets =
            this.shadowRoot!.querySelectorAll('[role="button"]')
        clickTargets.forEach((el) => {
            const handler = () => {
                this._playerType = this._detectPlayerType(src)
                // For YouTube and self-hosted, if a poster exists, emit video-play immediately
                if (
                    this.shadowRoot!.querySelector('.poster') &&
                    this._playerType !== 'vimeo'
                ) {
                    this._emitEvent('video-play')
                }
                this._loadVideo({
                    src,
                    sources,
                    allowFullscreen: !!allowFullscreen,
                    autoplay: true,
                })
            }
            el?.addEventListener('click', handler)
            el?.addEventListener('keydown', (e) => {
                const key = (e as KeyboardEvent).key
                if (key === 'Enter' || key === ' ') {
                    e.preventDefault()
                    handler()
                    // For self-hosted videos, set focus on the video element after loading
                    if (this._playerType === 'self-hosted') {
                        setTimeout(() => {
                            const video = this.shadowRoot!.querySelector(
                                '#selfHostedPlayer'
                            ) as HTMLVideoElement
                            video?.focus()
                        }, 600)
                    }
                }
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

        this._ytPlayer = new YT.Player(iframe, {
            events: {
                onReady: (event: any) => {
                    // Force play if autoplay is requested
                    if (event.target && event.target.playVideo) {
                        event.target.playVideo()
                    }
                },
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
        const url = iframe.getAttribute('src') || ''
        if (url.includes('autoplay=1')) {
            this._vimeoPlayer.play()
        }
        this._vimeoPlayer.on('play', () => this._emitEvent('video-play'))
        this._vimeoPlayer.on('pause', () => this._emitEvent('video-pause'))
        this._vimeoPlayer.on('ended', () => this._emitEvent('video-ended'))
    }

    private _setupSelfHostedPlayer() {
        const video = this.shadowRoot!.querySelector(
            '#selfHostedPlayer'
        ) as HTMLVideoElement
        if (!video) return

        if (video.getAttribute('data-listeners-attached') === 'true') return
        video.setAttribute('data-listeners-attached', 'true')

        video.addEventListener('play', () => this._emitEvent('video-play'))
        video.addEventListener('pause', () => this._emitEvent('video-pause'))
        video.addEventListener('ended', () => this._emitEvent('video-ended'))

        // Keep focus on the video for keyboard toggling
        video.focus()
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
