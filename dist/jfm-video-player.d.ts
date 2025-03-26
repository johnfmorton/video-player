export declare class VideoPlayer extends HTMLElement {
    static get observedAttributes(): string[];
    constructor();
    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void;
    _render(): void;
    _loadVideo({ src, sources, allowFullscreen, autoplay, }: {
        src: string;
        sources?: string;
        allowFullscreen: boolean;
        autoplay: boolean;
    }): void;
    _extractYouTubeID(url: string): string;
    _extractVimeoID(url: string): string;
}
export declare function registerVideoPlayer(tagName?: string): void;
export default VideoPlayer;
//# sourceMappingURL=jfm-video-player.d.ts.map