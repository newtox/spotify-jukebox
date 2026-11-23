registerPlugin({
    name: 'Jukebox Nick',
    version: '1.0.0',
    description: 'Sets the bot nickname to the song currently playing on the jukebox stream.',
    author: 'newtox <futzy261@gmail.com>',
    backends: ['ts3'],
    engine: '>= 1.0.0',
    vars: [
        {
            name: 'idleNick',
            title: 'Nickname when nothing plays',
            type: 'string',
            placeholder: 'TS-Jukebox'
        },
        {
            name: 'deviceName',
            title: 'DEVICE_NAME of the jukebox (sent as title while nothing plays)',
            type: 'string',
            placeholder: 'Jukebox'
        },
        {
            name: 'format',
            title: 'Show',
            type: 'select',
            options: ['Title only', 'Artist - Title'],
            default: '0'
        }
    ]
}, (_, config) => {
    const engine = require('engine');
    const event = require('event');
    const media = require('media');
    const audio = require('audio');

    const MAX_NICK = 30;
    const idleNick = (config.idleNick || 'TS-Jukebox').trim();
    const deviceName = (config.deviceName || 'Jukebox').trim();
    const titleOnly = String(config.format || '0') === '0';
    let current = null;

    function shorten(text) {
        return text.length <= MAX_NICK ? text : text.slice(0, MAX_NICK - 1).trimEnd() + '…';
    }

    function songOf(track) {
        if (!track) return '';
        let artist = (track.tempArtist() || '').trim();
        let title = (track.tempTitle() || '').trim();
        if (!artist && title.includes(' - ')) {
            const split = title.indexOf(' - ');
            artist = title.slice(0, split).trim();
            title = title.slice(split + 3).trim();
        }
        const full = artist && title ? `${artist} - ${title}` : title || artist;
        if (!full || full === deviceName) return '';
        return titleOnly && title ? title : full;
    }

    function show(text) {
        const nick = shorten(text || idleNick);
        if (nick === current) return;
        current = nick;
        engine.setNick(nick);
    }

    event.on('track', track => show(songOf(track)));
    event.on('trackInfo', track => show(songOf(track)));
    event.on('trackEnd', () => show(''));

    show(audio.isPlaying() ? songOf(media.getCurrentTrack()) : '');
});
