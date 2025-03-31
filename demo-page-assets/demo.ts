// Path: demo-page-assets/demo.ts
// This is the entry point for the demo page. It's a TypeScript file that
//  loads in the module that we're buidling with this repo

import Notify from 'simple-notify'
import 'simple-notify/dist/simple-notify.css'

import { registerVideoPlayer, VideoEventDetail } from '../lib/video-player'
registerVideoPlayer()

import './style.pcss'

document.addEventListener('DOMContentLoaded', () => {
    const videoPlayerYT = document.getElementById('youtube-example')
    const videoPlayerVimeo = document.getElementById('vimeo-example')
    const videoPlayerSelfHosted = document.getElementById('self-hosted-example')
    const videoPlayerYTshort = document.getElementById('youtube-short-example')

    if (videoPlayerYT) {
        const events = [
            'video-load',
            'video-play',
            'video-pause',
            'video-ended',
        ]
        events.forEach((eventName) => {
            videoPlayerYT.addEventListener(eventName, (event: Event) => {
                const customEvent = event as CustomEvent<VideoEventDetail>
                console.log(`Event: ${eventName}`, customEvent.detail)
                const title = eventName + ' on ' + customEvent.detail.type
                const time =
                    customEvent.detail.currentTime ? (customEvent.detail.currentTime + ' sec') : 'no time available'
                const text =
                    'src: ' + customEvent.detail.src + ' / time: ' + time
                showNotice(title, text, _eventToType(eventName))
            })
        })
    } else {
        console.warn("Video player with ID 'youtube-example' not found.")
    }

    if (videoPlayerVimeo) {
        const events = [
            'video-load',
            'video-play',
            'video-pause',
            'video-ended',
        ]

        events.forEach((eventName) => {
            videoPlayerVimeo.addEventListener(eventName, (event) => {
                const customEvent = event as CustomEvent<VideoEventDetail>
                console.log(`Event: ${eventName}`, customEvent.detail)
                const title = eventName + ' on ' + customEvent.detail.type
                const time =
                    customEvent.detail.currentTime ? (customEvent.detail.currentTime + ' sec') : 'no time available'
                const text =
                    'src: ' + customEvent.detail.src + ' / time: ' + time
                showNotice(title, text, _eventToType(eventName))
            })
        })
    } else {
        console.warn("Video player with ID 'vimeo-example' not found.")
    }

    if (videoPlayerSelfHosted) {
        const events = [
            'video-load',
            'video-play',
            'video-pause',
            'video-ended',
        ]

        events.forEach((eventName) => {
            videoPlayerSelfHosted.addEventListener(eventName, (event) => {
                const customEvent = event as CustomEvent<VideoEventDetail>
                console.log(`Event: ${eventName}`, customEvent.detail)
                const title = eventName + ' on ' + customEvent.detail.type
                const time =
                    customEvent.detail.currentTime ? (customEvent.detail.currentTime + ' sec') : 'no time available'
                const text =
                    'src: ' + customEvent.detail.src + ' / time: ' + time
                showNotice(title, text, _eventToType(eventName))
            })
        })
    } else {
        console.warn("Video player with ID 'self-hosted-example' not found.")
    }

    if (videoPlayerYTshort) {
        const events = [
            'video-load',
            'video-play',
            'video-pause',
            'video-ended',
        ]

        events.forEach((eventName) => {
            videoPlayerYTshort.addEventListener(eventName, (event) => {
                const customEvent = event as CustomEvent<VideoEventDetail>
                console.log(`Event: ${eventName}`, customEvent.detail)
                const title = eventName + ' on ' + customEvent.detail.type
                const time =
                    customEvent.detail.currentTime ? (customEvent.detail.currentTime + ' sec') : 'no time available'
                const text =
                    'src: ' + customEvent.detail.src + ' / time: ' + time
                showNotice(title, text, _eventToType(eventName))
            })
        })
    } else {
        console.warn("Video player with ID 'youtube-short-example' not found.")
    }
})


const _eventToType = (eventName: string) => {
  switch (eventName) {

    case 'video-load':
      return 'info'
    case 'video-play':
      return 'success'
    case 'video-pause':
      return 'warning'
    case 'video-ended':
      return 'error'
    default:
      return 'info'
  }
}

// showNotice function
const showNotice = (title: string, text: string, type: string = 'info') => {
  let status = 'info' as 'info' | 'success' | 'warning' | 'error';

  switch (type) {
    case 'info':
      status = 'info'
      break
    case 'error':
      status = 'error'
      break
    case 'success':
      status = 'success'
      break
    case 'warning':
      status = 'warning'
      break
    default:
      status = 'info'
  }


    new Notify({
        title: title,
        text: text,
        status,
        effect: 'slide',
        autoclose: true,
        autotimeout: 6500,
    })
}
