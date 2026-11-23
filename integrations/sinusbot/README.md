# Jukebox Nick (SinusBot)

SinusBot plugin that sets the bot's nickname to the song currently playing on the jukebox stream. While nothing plays, the bot shows a configurable idle nickname.

## Installation

1. Copy `jukebox-nick.js` into the `scripts` folder of your SinusBot instance (with Docker, the volume mounted at `/opt/sinusbot/scripts`).
2. Restart SinusBot.
3. In the SinusBot web interface, open **Settings → Scripts**, enable **Jukebox Nick** and save.
4. Let the bot play the jukebox stream.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| Nickname when nothing plays | `TS-Jukebox` | Nickname shown while the stream is idle |
| DEVICE_NAME of the jukebox | `Jukebox` | Must match `DEVICE_NAME` in the jukebox config; the stream sends this as its title while nothing plays |
| Show | `Title only` | `Title only` or `Artist - Title` |

TeamSpeak limits nicknames to 30 characters, so longer song names get cut off with `…`.
