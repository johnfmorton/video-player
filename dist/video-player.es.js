/**
 * name: @morton-studio/video-player
 * version: v1.0.0-beta.2
 * description: A web component for playing videos with suport for YouTube, Vimeo and self-hosted video.
 * author: John F. Morton <john@johnfmorton.com> (https://johnfmorton.com)
 * repository: git+https://github.com/johnfmorton/video-player.git
 * build date: 2025-03-29T17:05:39.590Z
 */
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class VideoPlayer extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "_playerType", "self-hosted");
    __publicField(this, "_ytPlayer");
    __publicField(this, "_vimeoPlayer");
    this.attachShadow({ mode: "open" });
    this._playerType = "self-hosted";
    this._render();
  }
  static get observedAttributes() {
    return [
      "src",
      "sources",
      "poster",
      "posters",
      "posteralt",
      "playbutton",
      "allowfullscreen",
      "aspect-ratio",
      "autosize"
    ];
  }
  attributeChangedCallback(_name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
    }
  }
  _emitEvent(eventName) {
    if (this._playerType === "self-hosted") {
      const video = this.shadowRoot.querySelector("#selfHostedPlayer");
      const detail = {
        type: this._playerType,
        src: this.getAttribute("src")
      };
      if (video) {
        detail.currentTime = video.currentTime;
        detail.duration = video.duration;
      }
      this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
    } else if (this._playerType === "youtube" && this._ytPlayer && typeof this._ytPlayer.getCurrentTime === "function") {
      const detail = {
        type: this._playerType,
        src: this.getAttribute("src"),
        currentTime: this._ytPlayer.getCurrentTime(),
        duration: this._ytPlayer.getDuration()
      };
      this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
    } else if (this._playerType === "vimeo" && this._vimeoPlayer) {
      Promise.all([
        this._vimeoPlayer.getCurrentTime(),
        this._vimeoPlayer.getDuration()
      ]).then(([currentTime, duration]) => {
        const detail = {
          type: this._playerType,
          src: this.getAttribute("src"),
          currentTime,
          duration
        };
        this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
      });
    } else {
      const detail = {
        type: this._playerType,
        src: this.getAttribute("src")
      };
      this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
    }
  }
  _detectPlayerType(src) {
    if (/youtube\.com|youtu\.be/.test(src)) return "youtube";
    if (/vimeo\.com/.test(src)) return "vimeo";
    return "self-hosted";
  }
  // Converts an aspect ratio string like "16x9" into CSS format "16 / 9"
  _getCssAspectRatio(aspect) {
    const parts = aspect.split("x");
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      return `${parts[0]} / ${parts[1]}`;
    }
    return "16 / 9";
  }
  _render() {
    const src = this.getAttribute("src") || "";
    const sources = this.hasAttribute("sources") ? this.getAttribute("sources") : void 0;
    const poster = this.getAttribute("poster") || "";
    const posters = this.getAttribute("posters");
    const posterAlt = this.getAttribute("posteralt") || "Video preview image";
    const showPlayButton = this.hasAttribute("playbutton");
    const allowFullscreen = this.hasAttribute("allowfullscreen");
    const autosize = this.hasAttribute("autosize");
    const aspectRatio = this.getAttribute("aspect-ratio") || "16x9";
    const aspectRatios = {
      "16x9": 56.25,
      "4x3": 75,
      "1x1": 100,
      "9x16": 177.78
    };
    const paddingTop = aspectRatios[aspectRatio] || 56.25;
    const cssAspectRatio = this._getCssAspectRatio(aspectRatio);
    let posterHTML = "";
    if (posters) {
      try {
        const parsed = JSON.parse(posters);
        const fallback = parsed.jpg || parsed.png || "";
        posterHTML = `
          <picture class="poster" tabindex="0" role="button" aria-label="Play video">
            ${parsed.avif ? `<source type="image/avif" srcset="${parsed.avif}">` : ""}
            ${parsed.webp ? `<source type="image/webp" srcset="${parsed.webp}">` : ""}
            ${parsed.jpg ? `<source type="image/jpeg" srcset="${parsed.jpg}">` : ""}
            ${parsed.png ? `<source type="image/png" srcset="${parsed.png}">` : ""}
            <img class="poster" src="${fallback}" alt="${posterAlt}" style="aspect-ratio: ${cssAspectRatio};">
          </picture>`;
      } catch (e) {
        console.warn("Invalid JSON in posters attribute:", e);
      }
    } else if (poster) {
      posterHTML = `<img class="poster" src="${poster}" alt="${posterAlt}" tabindex="0" role="button" aria-label="Play video" style="aspect-ratio: ${cssAspectRatio};">`;
    }
    const playButtonHTML = showPlayButton ? `<button class="play-button" aria-label="Play video"></button>` : "";
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          ${autosize ? "width: 100%;" : ""}
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
        <div class="video-container ${posterHTML ? "hidden" : ""}"></div>
      </div>
    `;
    const clickTargets = this.shadowRoot.querySelectorAll('[role="button"]');
    clickTargets.forEach((el) => {
      const handler = () => {
        this._playerType = this._detectPlayerType(src);
        if (this.shadowRoot.querySelector(".poster") && (this._playerType === "self-hosted" || this._playerType === "youtube")) {
          this._emitEvent("video-play");
        }
        this._loadVideo({
          src,
          sources,
          allowFullscreen: !!allowFullscreen,
          autoplay: true
        });
      };
      el == null ? void 0 : el.addEventListener("click", handler, { passive: true });
      el == null ? void 0 : el.addEventListener("keydown", (e) => {
        const key = e.key;
        if (key === "Enter" || key === " ") {
          e.preventDefault();
          handler();
          if (this._playerType === "self-hosted") {
            setTimeout(() => {
              const video = this.shadowRoot.querySelector("#selfHostedPlayer");
              video == null ? void 0 : video.focus();
            }, 600);
          }
        }
      });
    });
    if (!posterHTML) {
      this._playerType = this._detectPlayerType(src);
      this._emitEvent("video-load");
      this._loadVideo({
        src,
        sources,
        allowFullscreen: !!allowFullscreen,
        autoplay: false
      });
    }
  }
  _loadVideo({
    src,
    sources,
    allowFullscreen,
    autoplay
  }) {
    const container = this.shadowRoot.querySelector(".video-container");
    if (!container) return;
    let embedHTML = "";
    const allowAttrs = `allow="${autoplay ? "autoplay" : ""}"`;
    const fullscreenAttr = allowFullscreen ? "allowfullscreen" : "";
    if (/youtube\.com|youtu\.be/.test(src)) {
      this._playerType = "youtube";
      const videoId = this._extractYouTubeID(src);
      embedHTML = `<iframe id="ytPlayer" src="https://www.youtube.com/embed/${videoId}?enablejsapi=1${autoplay ? "&autoplay=1" : ""}" frameborder="0" ${allowAttrs} ${fullscreenAttr} title="YouTube Video"></iframe>`;
      setTimeout(() => this._setupYouTubePlayer(), 500);
    } else if (/vimeo\.com/.test(src)) {
      this._playerType = "vimeo";
      const videoId = this._extractVimeoID(src);
      embedHTML = `<iframe id="vimeoPlayer" src="https://player.vimeo.com/video/${videoId}?${autoplay ? "autoplay=1" : ""}" frameborder="0" ${allowAttrs} ${fullscreenAttr} title="Vimeo Video"></iframe>`;
      setTimeout(() => this._setupVimeoPlayer(), 500);
    } else {
      this._playerType = "self-hosted";
      let sourcesHTML = "";
      if (sources) {
        try {
          const parsed = JSON.parse(sources);
          sourcesHTML = parsed.map((s) => `<source src="${s.src}" type="${s.type}">`).join("\n");
        } catch (e) {
          console.warn("Invalid JSON in sources attribute:", e);
        }
      }
      embedHTML = `<video id="selfHostedPlayer" ${autoplay ? "autoplay" : ""} controls>
        ${sourcesHTML || `<source src="${src}" type="video/mp4">`}
        Your browser does not support the video tag.
      </video>`;
      setTimeout(() => this._setupSelfHostedPlayer(), 500);
    }
    container.innerHTML = embedHTML;
    container.classList.remove("hidden");
    const posterEl = this.shadowRoot.querySelector(".poster");
    posterEl == null ? void 0 : posterEl.classList.add("hidden");
    const playBtn = this.shadowRoot.querySelector(".play-button");
    playBtn == null ? void 0 : playBtn.classList.add("hidden");
  }
  _setupYouTubePlayer() {
    const iframe = this.shadowRoot.querySelector("#ytPlayer");
    if (!iframe) return;
    this._ytPlayer = new YT.Player(iframe, {
      events: {
        onReady: (event) => {
          if (event.target && event.target.playVideo && iframe.src.includes("autoplay=1")) {
            event.target.playVideo();
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING)
            this._emitEvent("video-play");
          if (event.data === YT.PlayerState.PAUSED)
            this._emitEvent("video-pause");
          if (event.data === YT.PlayerState.ENDED)
            this._emitEvent("video-ended");
        }
      }
    });
  }
  _setupVimeoPlayer() {
    const iframe = this.shadowRoot.querySelector("#vimeoPlayer");
    if (!iframe) return;
    if (this._vimeoPlayer) {
      this._vimeoPlayer.off("play");
      this._vimeoPlayer.off("pause");
      this._vimeoPlayer.off("ended");
    }
    this._vimeoPlayer = new Vimeo.Player(iframe);
    const url = iframe.getAttribute("src") || "";
    if (url.includes("autoplay=1")) {
      this._vimeoPlayer.play();
    }
    this._vimeoPlayer.on("play", () => this._emitEvent("video-play"));
    this._vimeoPlayer.on("pause", () => this._emitEvent("video-pause"));
    this._vimeoPlayer.on("ended", () => this._emitEvent("video-ended"));
  }
  _setupSelfHostedPlayer() {
    const video = this.shadowRoot.querySelector("#selfHostedPlayer");
    if (!video) return;
    if (video.getAttribute("data-listeners-attached") === "true") return;
    video.setAttribute("data-listeners-attached", "true");
    video.addEventListener("play", () => this._emitEvent("video-play"));
    video.addEventListener("pause", () => this._emitEvent("video-pause"));
    video.addEventListener("ended", () => this._emitEvent("video-ended"));
    video.focus();
  }
  _extractYouTubeID(url) {
    const regExp = /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  }
  _extractVimeoID(url) {
    const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  }
}
function registerVideoPlayer(tagName = "video-player") {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, VideoPlayer);
  }
}
export {
  VideoPlayer,
  VideoPlayer as default,
  registerVideoPlayer
};
