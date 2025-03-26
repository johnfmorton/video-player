// Path: demo-page-assets/demo.ts
// This is the entry point for the demo page. It's a TypeScript file that
//  loads in the module that we're buidling with this repo

// import {VideoPlayer, registerVideoPlayer} from '../lib/jfm-video-player'
// customElements.define('video-player', VideoPlayer)

import { registerVideoPlayer } from '../lib/jfm-video-player';
registerVideoPlayer()

import './style.pcss';
