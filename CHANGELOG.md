# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- WIP

## [1.0.0-beta.6] - 2025-03-31

- Fixed duplicate play event when clicking a YouTube video that had a poster image.
- Added autoload of YouTube or Vimeo API libraries when the `video-player` component is used. This change ensures that the necessary libraries are loaded automatically, improving the user experience and reducing potential errors related to missing libraries. You still encouraged to load them yourself, but this change makes it easier for users who may not be familiar with the process.

## [1.0.0-beta.5] - 2025-03-31

- Fixed an issue with the `video-player` web component on iOS where the YouTube video would not play as expected when user clicked a poster frame. This change improves the user experience on iOS devices and ensures consistent behavior across platforms.

## [1.0.0-beta.4] - 2025-03-29

- Not released publicly.

## [1.0.0-beta.3] - 2025-03-28

- No code changes in the web component. Documentation work in progress.

## [1.0.0-beta.2] - 2025-03-28

- Initial release of the `video-player` web component as beta 2.

## [1.0.0-beta.1] - 2023-03-01

### Added

- Added `CHANGELOG.md` file. Sorry for the delay on this one, if you've been watching this as it has gone through development. I'll try to keep this up to date from now on. We're still in an alpha state, so breaking changes will still happen, but I will document them here.
