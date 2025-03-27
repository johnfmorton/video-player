// Path: demo-page-assets/demo.ts
// This is the entry point for the demo page. It's a TypeScript file that
//  loads in the module that we're buidling with this repo

// import {VideoPlayer, registerVideoPlayer} from '../lib/jfm-video-player'
// customElements.define('video-player', VideoPlayer)

import Notify from 'simple-notify'
import 'simple-notify/dist/simple-notify.css'

import { registerVideoPlayer } from '../lib/jfm-video-player'
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
            videoPlayerYT.addEventListener(eventName, (event) => {
              console.log(`Event: ${eventName}`, event.detail)
              new Notify({
                  title: 'Event ' + eventName + ' on ' + event.detail.type,
                  text: 'src: ' + event.detail.src,
              })
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
              console.log(`Event: ${eventName}`, event.detail)
              new Notify({
                  title: 'Event ' + eventName + ' on ' + event.detail.type,
                  text: 'src: ' + event.detail.src,
              })
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
              console.log(`Event: ${eventName}`, event.detail)
                  new Notify({
                      title: 'Event ' + eventName + ' on ' + event.detail.type,
                      text: 'src: ' + event.detail.src,
                  })

            })
        })
    } else {
        console.warn("Video player with ID 'self-hosted-example' not found.")
    }

  if (videoPlayerYTshort) {
      const events = ['video-load', 'video-play', 'video-pause', 'video-ended']

      events.forEach((eventName) => {
          videoPlayerYTshort.addEventListener(eventName, (event) => {
              console.log(`Event: ${eventName}`, event.detail)
              new Notify({
                  title: 'Event ' + eventName + ' on ' + event.detail.type,
                  text: 'src: ' + event.detail.src,
              })
          })
      })
  } else {
      console.warn("Video player with ID 'self-hosted-example' not found.")
  }
})
