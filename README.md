# spotify-jukebox

A Spotify Connect speaker that streams what it plays as MP3 over HTTP. It shows up in your Spotify app as a device
("Jukebox"); anything that can play a stream URL can play it for everyone listening: a TeamSpeak music bot, an area
in WorkAdventure, a browser. Like a jam session: one person with Spotify Premium picks the music, everyone hears it.

```
Spotify app ──(Connect)──▶ librespot ──PCM──▶ pacer ──▶ ffmpeg (MP3) ──HTTP──▶ listeners
```

- The stream never breaks off: while nothing plays, listeners get silence, and the music comes back as soon as you press play.
- A few seconds behind the app, like a radio: the jukebox itself adds well under a second, the rest is the player's buffer.
- Players that ask for ICY metadata (radio players, SinusBot) get the current song as the stream title.
- Needs a **Spotify Premium** account (librespot only works with Premium).

Note: Spotify's terms don't allow rebroadcasting its music. Keep the stream private (bound to localhost or a
hard-to-guess `STREAM_PATH`) and for a few friends only.

## Running

```yaml
services:
  jukebox:
    image: ghcr.io/newtox/spotify-jukebox:latest
    container_name: jukebox
    restart: unless-stopped
    environment:
      DEVICE_NAME: "Jukebox"
      STREAM_PATH: "stream"
      INITIAL_VOLUME: "80"
    ports:
      - "127.0.0.1:8099:8000"
    volumes:
      - /docker_volumes/jukebox:/data
```

The stream is then at `http://127.0.0.1:8099/stream` on the host.

### Logging in to Spotify (once)

```sh
docker exec -it jukebox jukebox-login
```

Open the printed link, log in with the Premium account, then copy the address of the page that fails to load
(`http://127.0.0.1/login?code=...`) back into the terminal. When it says "Authenticated", press Ctrl+C.
The login is saved in `/data`; the jukebox starts by itself a few seconds later.

Then pick the jukebox as the device in Spotify.

### TeamSpeak (SinusBot)

If SinusBot runs with `network_mode: host` on the same machine, add `http://127.0.0.1:8099/stream` as a radio
station and play it. The bot plays the music in its channel. If SinusBot runs in its own Docker network instead,
put the jukebox in that network and use `http://jukebox:8000/stream`.

To show the current song as the bot's nickname, install the [Jukebox Nick](integrations/sinusbot/README.md) plugin.

### WorkAdventure

The stream has to be reachable from the browser, so put it behind your reverse proxy with a hard-to-guess
`STREAM_PATH`. With Caddy, inside the WorkAdventure site block:

```
handle_path /jukebox/* {
    reverse_proxy 127.0.0.1:8099
}
```

Map editor → draw an area around the jukebox → property **Play audio file** →
`https://<your WorkAdventure domain>/jukebox/<STREAM_PATH>`. Everyone who walks in hears the music, walking out stops it.

## Settings

| Variable | Default | |
|---|---|---|
| `DEVICE_NAME` | `Jukebox` | Name in the Spotify device list |
| `STREAM_PATH` | `stream` | Path of the stream; make it hard to guess |
| `MP3_BITRATE` | `192k` | Bitrate of the stream |
| `SPOTIFY_BITRATE` | `320` | Quality fetched from Spotify (96, 160, 320) |
| `INITIAL_VOLUME` | `80` | Volume in % after a start |
| `VOLUME_CTRL` | `log` | How the Spotify volume slider maps to loudness (`log`, `cubic`, `linear`). The slider sets the volume for everyone |
| `PORT` | `8000` | HTTP port inside the container |

`GET /health` tells whether the jukebox is logged in and how many people listen.

## License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). librespot is MIT licensed, ffmpeg is LGPL/GPL (installed from Debian).
