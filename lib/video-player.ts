/// <reference lib="dom" />

// If you have global YT or Vimeo APIs, declare them for TS:
// Alternatively, define them in a separate .d.ts file.
declare var YT: any
declare var Vimeo: any

export interface VideoEventDetail {
    type: 'self-hosted' | 'youtube' | 'vimeo'
    src: string | null
    currentTime?: number
    duration?: number
}

declare global {
    interface Window {
        YT?: any
        Vimeo?: any
    }
}

export interface VideoPlayerEvent extends CustomEvent<VideoEventDetail> {}

// VideoPlayer Custom Element: Manages video playback from self-hosted, YouTube, and Vimeo sources.
export class VideoPlayer extends HTMLElement {
    private _playerType: 'self-hosted' | 'youtube' | 'vimeo' = 'self-hosted'
    private _ytPlayer: any
    private _vimeoPlayer: any

    private _ytPlayerReady: boolean = false
    private _playOnReady: boolean = false

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

    // Constructor: Initializes the video player by attaching a shadow DOM and rendering the initial content.
    constructor() {
        super()
        // Removed tabindex on host to avoid extra tab stops.
        this.attachShadow({ mode: 'open' })
        this._playerType = 'self-hosted'
        this._render()
    }

    // attributeChangedCallback: Invoked when any observed attribute changes. Triggers re-rendering of the component.
    attributeChangedCallback(
        _name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        if (oldValue !== newValue) {
            this._render()
        }
    }

    private _debounceInterval = 500 // 0.5 second, adjust as needed
    private _lastPlayEventTime = 0

    // _emitEvent: Emits a custom event (e.g., video-play, video-pause) with details about the current video state, based on the player type.
  private _emitEvent(eventName: string, initialPosterClick = false) {




        // If this is a "video-play" event, check for debounce
        if (eventName === 'video-play') {
            const now = performance.now()
            if (now - this._lastPlayEventTime < this._debounceInterval) {
                // Skip this call if it's within our debounce threshold
                return
            }
            this._lastPlayEventTime = now

          // If this is an initial poster click, set the last play event time to 5 seconds in the future
          // This is to prevent the play event from being emitted too quickly after the poster is clicked
          // This is a workaround for the fact that the YouTube player is unreliable in firing the play event
          // when the poster is clicked. Sometimes it fires, sometimes it doesn't. So, we manually set
          // the last play event time to 5 seconds in the future to prevent the play event from being emitted
          // too quickly after the poster is clicked.
            if (initialPosterClick) {
                this._lastPlayEventTime = performance.now() + 5000
            }
        }

        // The YouTube branch now only fires after the player is ready (via onStateChange)
        if (this._playerType === 'self-hosted') {
            const video = this.shadowRoot!.querySelector(
                '#selfHostedPlayer'
            ) as HTMLVideoElement
            const detail: VideoEventDetail = {
                type: this._playerType,
                src: this.getAttribute('src'),
            }
            if (video) {
                detail.currentTime = video.currentTime
                detail.duration = video.duration
            }
            this.dispatchEvent(
                new CustomEvent<VideoEventDetail>(eventName, {
                    detail,
                    bubbles: true,
                    composed: true,
                }) as VideoPlayerEvent
            )
        } else if (this._playerType === 'youtube' && this._ytPlayer) {
            // For YouTube, reading from the playerInfo or using getCurrentTime() / getDuration()
            const detail: VideoEventDetail = {
                type: this._playerType,
                src: this.getAttribute('src'),
                currentTime: this._ytPlayer.playerInfo?.currentTime ?? 0,
                duration: this._ytPlayer.playerInfo?.duration ?? 0,
            }
            this.dispatchEvent(
                new CustomEvent<VideoEventDetail>(eventName, {
                    detail,
                    bubbles: true,
                    composed: true,
                }) as VideoPlayerEvent
            )
        } else if (this._playerType === 'vimeo' && this._vimeoPlayer) {
            // Promise-based calls for Vimeo
            Promise.all([
                this._vimeoPlayer.getCurrentTime(),
                this._vimeoPlayer.getDuration(),
            ]).then(([currentTime, duration]) => {
                const detail: VideoEventDetail = {
                    type: this._playerType,
                    src: this.getAttribute('src'),
                    currentTime,
                    duration,
                }
                this.dispatchEvent(
                    new CustomEvent<VideoEventDetail>(eventName, {
                        detail,
                        bubbles: true,
                        composed: true,
                    }) as VideoPlayerEvent
                )
            })
        } else {
            // Fallback: event without timing data
            const detail: VideoEventDetail = {
                type: this._playerType,
                src: this.getAttribute('src'),
            }
            this.dispatchEvent(
                new CustomEvent<VideoEventDetail>(eventName, {
                    detail,
                    bubbles: true,
                    composed: true,
                }) as VideoPlayerEvent
            )
        }
    }

    // _detectPlayerType: Determines the video player type (YouTube, Vimeo, or self-hosted) from the provided source URL.
    private _detectPlayerType(
        src: string
    ): 'youtube' | 'vimeo' | 'self-hosted' {
        if (/youtube\.com|youtu\.be/.test(src)) return 'youtube'
        if (/vimeo\.com/.test(src)) return 'vimeo'
        return 'self-hosted'
    }

    // Converts an aspect ratio string like "16x9" into CSS format "16 / 9"
    // _getCssAspectRatio: Converts an aspect ratio string (e.g., '16x9') into a CSS-compatible format (e.g., '16 / 9').
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

    // _render: Renders the video player UI including the poster image, play button, and video container, then attaches event listeners for interactions.
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
          pointer-events: none; /* For poster-based videos, we rely on the poster click */
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

        this._playerType = this._detectPlayerType(src)
        // Dynamically load YouTube or Vimeo API if not present
        if (this._playerType === 'youtube') {
            if (
                !window.YT &&
                !document.querySelector(
                    'script[src="https://www.youtube.com/iframe_api"]'
                )
            ) {
                const script = document.createElement('script')
                script.src = 'https://www.youtube.com/iframe_api'
                document.head.appendChild(script)
            }
        }

        if (this._playerType === 'vimeo') {
            if (
                !window.Vimeo &&
                !document.querySelector(
                    'script[src="https://player.vimeo.com/api/player.js"]'
                )
            ) {
                const script = document.createElement('script')
                script.src = 'https://player.vimeo.com/api/player.js'
                document.head.appendChild(script)
            }
        }

        this._loadVideo({
            src,
            sources,
            allowFullscreen: !!allowFullscreen,
            autoplay: false,
            removeOverlay: false,
        })

        // Attach both click and keydown listeners to interactive elements
        const clickTargets = this.shadowRoot!.querySelectorAll(
            '[role="button"], .play-button'
        )
        clickTargets.forEach((el) => {
            const handler = () => {
                // Remove the overlay poster and play button
                const posterEl = this.shadowRoot!.querySelector('.poster')
                posterEl?.classList.add('hidden')
                const playBtn = this.shadowRoot!.querySelector('.play-button')
                playBtn?.classList.add('hidden')

                // Unhide the video container
                const container =
                    this.shadowRoot!.querySelector('.video-container')
                container?.classList.remove('hidden')

                if (this._playerType === 'youtube') {
                    // debugger;
                    this._playerType = this._detectPlayerType(src)

                    this._loadVideo({
                        src,
                        sources,
                        allowFullscreen: !!allowFullscreen,
                        autoplay: true,
                    })
                    this._emitEvent('video-play', true)

                    // If the YouTube player instance exists and has a playVideo function
                    if (
                        this._ytPlayer &&
                        typeof this._ytPlayer.playVideo === 'function'
                    ) {
                        if (this._ytPlayerReady) {
                            this._ytPlayer.playVideo()
                            this._emitEvent('video-play', true)
                        } else {
                            this._playOnReady = true
                        }
                    } else {
                        // YouTube player not yet instantiated; set flag to play when ready
                        this._playOnReady = true
                    }
                } else if (this._playerType === 'vimeo' && this._vimeoPlayer) {
                    this._vimeoPlayer.play()
                    // Vimeo player's play event will trigger video-play emission
                } else if (this._playerType === 'self-hosted') {
                    const video = this.shadowRoot!.querySelector(
                        '#selfHostedPlayer'
                    ) as HTMLVideoElement
                    video?.play()
                    // The self-hosted player's event listener will emit video-play
                }
            }
            el?.addEventListener('click', handler, { passive: true })
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
    }

    // _loadVideo: Loads and embeds the appropriate video player (iframe for YouTube/Vimeo or video element for self-hosted) based on the source URL and attributes.
    private _loadVideo({
        src,
        sources,
        allowFullscreen,
        autoplay,
        removeOverlay = true,
    }: {
        src: string
        sources?: string
        allowFullscreen: boolean
        autoplay: boolean
        removeOverlay?: boolean
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
            if (!videoId) {
                embedHTML = `<div class="error">Invalid YouTube video URL provided.</div>`
            } else {
                embedHTML = `<iframe id="ytPlayer" src="https://www.youtube.com/embed/${videoId}?enablejsapi=1${
                    autoplay ? '&autoplay=1' : ''
                }" frameborder="0" ${allowAttrs} ${fullscreenAttr} title="YouTube Video"></iframe>`
                setTimeout(() => this._setupYouTubePlayer(), 500)
            }
        }
        // Vimeo
        else if (/vimeo\.com/.test(src)) {
            this._playerType = 'vimeo'
            const videoId = this._extractVimeoID(src)
            if (!videoId) {
                embedHTML = `<div class="error">Invalid Vimeo video URL provided.</div>`
            } else {
                embedHTML = `<iframe id="vimeoPlayer" src="https://player.vimeo.com/video/${videoId}?${
                    autoplay ? 'autoplay=1' : ''
                }" frameborder="0" ${allowAttrs} ${fullscreenAttr} title="Vimeo Video"></iframe>`
                setTimeout(() => this._setupVimeoPlayer(), 500)
            }
        }
        // Self-hosted
        else {
            this._playerType = 'self-hosted'
            if (!src) {
                embedHTML = `<div class="error">No video URL provided.</div>`
            } else {
                let sourcesHTML = ''
                if (sources) {
                    try {
                        const parsed: { src: string; type: string }[] =
                            JSON.parse(sources)
                        sourcesHTML = parsed
                            .map(
                                (s) =>
                                    `<source src="${s.src}" type="${s.type}">`
                            )
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
        }

        container.innerHTML = embedHTML

        if (removeOverlay) {
            const posterEl = this.shadowRoot!.querySelector('.poster')
            posterEl?.classList.add('hidden')
            const playBtn = this.shadowRoot!.querySelector('.play-button')
            playBtn?.classList.add('hidden')
        }
    }

    // _setupYouTubePlayer: Initializes the YouTube player using the YouTube API and sets up event handlers for player state changes.
    private _setupYouTubePlayer() {
        const iframe = this.shadowRoot!.querySelector('#ytPlayer') as HTMLIFrameElement;
        if (!iframe) return;

        // If the YouTube API is already available, set up immediately
        if (window.YT && window.YT.Player) {
            this._initializeYouTubePlayer(iframe);
        } else {
            // Otherwise, wait for onYouTubeIframeAPIReady
            const existingCallback = (window as any).onYouTubeIframeAPIReady;
            (window as any).onYouTubeIframeAPIReady = () => {
                if (existingCallback) {
                    existingCallback();
                }
                this._initializeYouTubePlayer(iframe);
            };
        }
    }

    // _initializeYouTubePlayer: Helper to do the actual new YT.Player call
    private _initializeYouTubePlayer(iframe: HTMLIFrameElement) {
        this._ytPlayer = new YT.Player(iframe, {
            events: {
                onReady: (event: any) => {
                    this._ytPlayerReady = true;
                    if (this._playOnReady) {
                        event.target.playVideo();
                        this._playOnReady = false;
                    }
                },
                onStateChange: (event: any) => {
                    if (event.data === YT.PlayerState.PLAYING)
                        this._emitEvent('video-play');
                    if (event.data === YT.PlayerState.PAUSED)
                        this._emitEvent('video-pause');
                    if (event.data === YT.PlayerState.ENDED)
                        this._emitEvent('video-ended');
                },
            },
        });
    }

    // _setupVimeoPlayer: Initializes the Vimeo player using the Vimeo API and sets up event handlers for player state changes.
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

    // _setupSelfHostedPlayer: Sets up the self-hosted video element by attaching event listeners for play, pause, and ended events, and ensures accessibility by focusing the video.
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

    // _extractYouTubeID: Extracts the YouTube video ID from the provided URL using a regular expression.
    private _extractYouTubeID(url: string): string {
        const regExp =
            /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url.match(regExp)
        return match ? match[1] : ''
    }

    // _extractVimeoID: Extracts the Vimeo video ID from the provided URL using a regular expression.
    private _extractVimeoID(url: string): string {
        const regExp = /vimeo\.com\/(?:video\/)?(\d+)/
        const match = url.match(regExp)
        return match ? match[1] : ''
    }
}

// register the custom element for umd
if (typeof window !== 'undefined') {
  // Check if the custom element is already defined
  if (!customElements.get('video-player')) {
    // Define the custom element
    customElements.define('video-player', VideoPlayer)
  }
}

// registerVideoPlayer: Registers the VideoPlayer custom element with the browser if it hasn't been registered already.
export function registerVideoPlayer(tagName = 'video-player') {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, VideoPlayer)
    }
}

export default VideoPlayer
