# better-discord-music
 
# !! Playlists, Spotify & Soundcloud are currently not supported but I'm working on it !!

## Functions
- .play() - Plays the given music in the given channel.
- .stop() - Stops the music whenever it is playing.
- .skip() - Skips the current playing song.
- .pause() - Pauses the current playing song.
- .resume() - Resumes the playing song whenever it is paused.
- .repeat() - Repeats the playing song forever, until it is turned off.
- .volume() - Changes the music volume.
- .jump() - Jumps to a the given queue number song.
- .getQueue() - Returns a Array of queued songs.
- .removeQueue() - Removes the given queue song number from the queue.

- .isConnected() - Checks whenever the bot is connected to a VC.
- .isPaused() - Checks whenever the playing song is paused.
- .isResumed() - Checks whenever the bot is playing a song.
- .isRepeated() - Checks whenever the playing song is on repeat.

### .play()
```
const musicbot = require('better-discord-music');

musicbot.play({
   interaction: interaction,
   channel: channel,
   song: song
});
```

### .stop()
```
const musicbot = require('better-discord-music');

musicbot.stop({ interaction: interaction });
```

### .skip()
```
const musicbot = require('better-discord-music');

musicbot.skip({ interaction: interaction });
```

### .pause()
```
const musicbot = require('better-discord-music');

musicbot.pause({ interaction: interaction });
```

### .resume()
```
const musicbot = require('better-discord-music');

musicbot.resume({ interaction: interaction });
```

### .repeat()
```
const musicbot = require('better-discord-music');

musicbot.repeat({
   interaction: interaction,
   value: true/false
});
```

### .volume()
```
const musicbot = require('better-discord-music');

musicbot.volume({
   interaction: interaction,
   volume: volume
});
```

### .jump()
```
const musicbot = require('better-discord-music');

musicbot.jump({
   interaction: interaction,
   number: number
});
```

### .getQueue()
```
const musicbot = require('better-discord-music');

console.log(await(musicbot.getQueue({ interaction: interaction })));
```


### .removeQueue()
```
const musicbot = require('better-discord-music');

musicbot.removeQueue({
   interaction: interaction,
   number: number 
});
```

### .isConnected()
```
const musicbot = require('better-discord-music');

console.log(await musicbot.isConnected({ interaction: interaction }))
```

### .isPaused()
```
const musicbot = require('better-discord-music');

console.log(await musicbot.isPaused({ interaction: interaction }))
```


### .isResumed()
```
const musicbot = require('better-discord-music');

console.log(await musicbot.isResumed({ interaction: interaction }))
```


### .isPaused()
```
const musicbot = require('better-discord-music');

console.log(await musicbot.isRepeated({ interaction: interaction }))
```



## Events
- playSong - Runs whenever a new song started playing.
- addSong - Runs whenever a song has been added to the queue.
- playList - Runs whenever a new song of a playlist started playing.
- addList - Runs whenever a playlist has been added to the queue.
- finish - Runs whenever all the queued songs are played.

```
const musicbot = require('better-discord-music');
const eventHandler = musicbot.event;

eventHandler.on('playSong', async (channel, songInfo, requester) => {
    channel.send({
        content: `Started playing the song [${songInfo.title}](${songInfo.url}) by \`${songInfo.author}\`.
        This was requested by ${requester.tag} (${requester.id})`
    });
});

eventHandler.on('addSong', async (channel, songInfo, requester) => {
    channel.send({
        content: `Added the song [${songInfo.title}](${songInfo.url}) by \`${songInfo.author}\` to the queue.
        Added by ${requester.tag} (${requester.id})`
    });
});

eventHandler.on('playList', async (channel, playlist, songInfo, requester) => {
    channel.send({
        content: `Started playing the song [${songInfo.title}](${songInfo.url}) by \`${songInfo.author}\` of the playlist ${playlist.title}.
        This was requested by ${requester.tag} (${requester.id})`
    });
});

eventHandler.on('addList', async (channel, playlist, requester) => {
    channel.send({
        content: `Added the playlist [${playlist.title}](${playlist.url}) with ${playlist.videos.length} amount of videos to the queue.
        Added by ${requester.tag} (${requester.id})`
    });
});

eventHandler.on('finish', async (channel) => {
    channel.send({
        content: 'Party has been ended :('
    });
});