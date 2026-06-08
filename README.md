<p align="center">
  <img src="buoy-logo.png" alt="Buoy" width="128">
</p>

<h1 align="center">Buoy</h1>

<p align="center">
  Keep your bots running. Without the terminal.
</p>

<p align="center">
  <a href="../../releases"><img alt="Releases" src="https://img.shields.io/github/v/release/newt-dev-sudo/Buoy?include_prereleases&sort=semver&style=flat-square"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-blue?style=flat-square"></a>
  <a href="#"><img alt="Platform" src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square"></a>
</p>

<p align="center">
  <a href="../../releases"><strong>Download</strong></a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="CODE_OF_CONDUCT.md">Code of Conduct</a>
</p>

---

## What is Buoy?

You wrote a Discord bot, a webhook service, or a background worker. Now you need it to stay online. Buoy is a desktop app that handles the boring parts — starting, stopping, monitoring, and restarting your bots — so you can focus on writing code.

## Quickstart

1. **Download** the latest installer from [Releases](../../releases)
2. **Add Bot** → point to your project folder
3. **Set env vars** → tokens, API keys, secrets
4. **Start** → your bot runs, and stays running

## Features

| Feature | What it means |
|---------|---------------|
| **Auto-restart** | Bot crashes? Buoy brings it back with backoff. |
| **One-click control** | Start, stop, restart — no terminal needed. |
| **Dependency install** | `npm install` or `pip install` from the UI. |
| **Live logs** | stdout/stderr in real time, with 7-day retention. |
| **Secure env vars** | Tokens encrypted locally, injected at runtime. |
| **System tray** | Close the window. Bots keep running. |
| **Persistent state** | Reopen Buoy — bots pick up where they left off. |

## Requirements

- Node.js or Python installed on your system
- A `package.json` or `requirements.txt` in your bot folder

## Platform Support

| Platform | Status | Installer |
|----------|--------|-----------|
| Windows | ✅ | `.msi`, `.exe` |
| macOS | ✅ | `.dmg` |
| Linux | ✅ | `.deb`, `.AppImage` |

## Screenshots

<!-- TODO: Add screenshots -->

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
