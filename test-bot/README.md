# Test Bot for Buoy

A simple Discord.js bot for testing Buoy's bot management features.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set the `DISCORD_TOKEN` environment variable in Buoy's bot settings

3. Start the bot from Buoy's dashboard

## Features tested

- Bot process spawning and lifecycle
- Console log capture in Buoy
- Auto-restart on crash (simulated after 60 seconds)
- Graceful shutdown on stop
- Environment variable injection (DISCORD_TOKEN)
