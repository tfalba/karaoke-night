# Karaoke Night

A neon-soaked karaoke queue manager that finds the best karaoke videos on YouTube,
keeps the rotation fair, and persists the party between sessions.

## Project Snapshot

- ID: karaoke-night
- Role: design, front-end, back-end
- Tech Stack: React, TypeScript, Vite, Tailwind CSS, YouTube Data API, react-youtube
- Summary: A club-mode karaoke queue that auto-finds YouTube karaoke versions,
  rotates singers fairly, and tracks the session in local storage.

## Description

### Overview

Karaoke Night turns a shared queue into a smooth, fair rotation by combining
YouTube search, karaoke-focused scoring, and a lightweight local state machine.

### Steps

1. Pick one or more singers and enter a song request.
2. Search YouTube for a "karaoke version" and score candidates by keywords,
   channel reputation, and view counts.
3. Add the best match to the queue with singer metadata and avatars.
4. Advance to the next singer using weighted rotation that avoids repeats
   when possible.
5. Persist the queue and now-playing state until the party is reset.

## Details

### Summary

Singers add songs to the queue, the app selects the best karaoke video from
YouTube, and a weighted picker balances turns based on remaining songs. The
interface keeps the main video stage clear, while drawers manage queue and rules.

### Key Features

- Weighted singer rotation that avoids the last singer when possible.
- YouTube scoring tuned for karaoke channels and strong "karaoke version" intent.
- Queue drawer with "make next" overrides and per-entry removal.
- Local storage persistence with a one-click reset.

### How Built

- React + TypeScript UI bootstrapped with Vite for fast local iteration.
- Tailwind CSS neon theme with custom cards and drawer panels.
- YouTube Data API search + stats, embedded via react-youtube.
- Local storage persistence for entries, now-playing, and last singer state.

## Links

- Live URL: not deployed
- GitHub URL: this repository
