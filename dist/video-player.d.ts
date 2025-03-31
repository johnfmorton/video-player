/// <reference lib="dom" />
export interface VideoEventDetail {
    type: 'self-hosted' | 'youtube' | 'vimeo';
    src: string | null;
    currentTime?: number;
    duration?: number;
}
export interface VideoPlayerEvent extends CustomEvent<VideoEventDetail> {
}
export declare class VideoPlayer extends HTMLElement {
    private _playerType;
    private _ytPlayer;
    private _vimeoPlayer;
    private _ytPlayerReady;
    private _playOnReady;
    static get observedAttributes(): string[];
    constructor();
    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void;
    private _emitEvent;
    private _detectPlayerType;
    private _getCssAspectRatio;
    private _render;
    private _loadVideo;
    private _setupYouTubePlayer;
    private _setupVimeoPlayer;
    private _setupSelfHostedPlayer;
    private _extractYouTubeID;
    private _extractVimeoID;
}
export declare function registerVideoPlayer(tagName?: string): void;
export default VideoPlayer;
//# sourceMappingURL=video-player.d.ts.map