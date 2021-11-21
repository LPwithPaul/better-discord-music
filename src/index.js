const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, entersState, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const events = require('events');
const eventEmitter = new events.EventEmitter();
global.eventEmitter = eventEmitter;
const guildData = new Map();
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const url_1 = require("url");
const customPlugins = {
    spotify: require('../plugins/spotify.js'),
    soundcloud: require('../plugins/soundcloud.js'),
}

module.exports = {
    event: eventEmitter,
    guildData: guildData,
}
module.exports.play = async (options = {}) => {
    const { interaction, channel, song } = options;
    if (!channel || channel?.type !== 'GUILD_VOICE') return eventEmitter.emit("error", { errorCode: "INVALID_VOICE_CHANNEL", errorMsg: `There is no valid VoiceChannel provided.` });
    if (!song || typeof song !== 'string') return eventEmitter.emit("error", { errorCode: "INVALID_SONG", errorMsg: `There is no valid song provided.` });
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });

    const data = guildData.get(channel.guild.id) || {};

    if (!channel.guild.me.voice.channel) {
        data.connection = await connectToChannel(channel);
    };
    if (!data.connection) {
        data.connection = await connectToChannel(channel);
    };
    if (!data.queue) data.queue = [];
    if (!data.repeat) data.repeat = false;
    data.guildId = channel.guild.id;
    let songInfo;
    /*for (const plugin of customPlugins) {
        if (await plugin.validate(song)) {
            return plugin.play({ interaction: interaction, channel: channel, song: song }); //play the song
        }
    }*/

    if (typeof song == 'string') {
        if (isURL(song)) {
            if (song.includes('list=')) {
                console.log("list")
                console.log(song)
                const plid = ytpl.getPlaylistID(song)
                if (plid) {
                    const playlist = await ytpl(plid, { limit: Infinity });
                    await playlist.items.forEach(item => {
                        songInfo = {
                            title: item.title,
                            duration: item.timestamp,
                            formatedDuration: formatDuration(info.videoDetails.lengthSeconds),
                            author: item.author,
                            url: item.url,
                            thumbnail: item.thumbnail,
                            related: info.related_videos,
                            extra: {
                                type: 'playlist',
                                playlist: playlist,
                            }
                        }
                        data.queue.push({
                            info: songInfo,
                            requester: interaction.user,
                            url: songInfo.url,
                            channel: interaction.channel
                        });
                    });
                }
            } else {
                console.log("video")
                const songId = ytdl.getURLVideoID(song)
                const info = await ytdl.getInfo(songId);
                const item = ytdl(songId)
                //console.log(info);

                songInfo = {
                    title: info.videoDetails.title,
                    duration: info.videoDetails.lengthSeconds,
                    formatedDuration: formatDuration(info.videoDetails.lengthSeconds),
                    author: info.videoDetails.author.name,
                    url: info.videoDetails.videoId,
                    thumbnail: info.videoDetails.thumbnails,
                    related: info.related_videos,
                    extra: {
                        type: 'video',
                        playlist: null,
                    }
                }
                data.queue.push({
                    info: songInfo,
                    requester: interaction.user,
                    url: songInfo.url,
                    channel: interaction.channel
                });

            }
        }
    } else {
        //youtube search
    }
    if (!data.dispatcher) {

        playSong(data, interaction);

    } else {

        if (songInfo.extra.type === 'playlist') {
            eventEmitter.emit('addList', interaction.channel, songInfo.extra.playlist, interaction.user);
        } else {
            eventEmitter.emit('addSong', interaction.channel, songInfo, interaction.user);
        }

    };
    guildData.set(channel.guild.id, data);

}
module.exports.isConnected = async (options = {}) => {

    const { interaction } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });

    const fetchedData = guildData.get(interaction.guild.id);

    if (!fetchedData?.connection && !fetchedData?.player) return Boolean(false)
    else return Boolean(true)

};
module.exports.stop = async (options = {}) => {

    const { interaction } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });

    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = await guildData.get(interaction.guild.id);

    fetchedData.player.stop();
    fetchedData.connection.destroy();
    guildData.delete(interaction.guild.id);

};
module.exports.repeat = async (options = {}) => {

    const { interaction, value } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });
    if (!value) value === false;
    if (value === undefined || typeof value !== 'boolean') eventEmitter.emit("error", { errorCode: "INVALID_BOOLEAN", errorMsg: `There is no valid Boolean provided.` });

    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = await guildData.get(interaction.guild.id);

    if (fetchedData?.repeat === value) return eventEmitter.emit("error", { errorCode: "ALREADY_REPEATED", errorMsg: `The song is already on repeat, check this with the isRepeated() function.` })

    fetchedData.repeat = value;
    guildData.set(interaction.guild.id, fetchedData);

}
module.exports.isRepeated = async (options = {}) => {

    const { interaction } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });

    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = guildData.get(interaction.guild.id);

    return Boolean(fetchedData.repeat);

}
module.exports.skip = async (options = {}) => {

    const { interaction } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });

    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = await guildData.get(interaction.guild.id);
    const player = await fetchedData.player;
    const connection = await fetchedData.connection

    const finishChannel = await fetchedData.queue[0].channel
    await fetchedData.queue.shift();

    if (fetchedData.queue.length > 0) {

        guildData.set(interaction.guild.id, fetchedData);

        playSong(fetchedData, interaction)

    } else {

        await eventEmitter.emit('finish', finishChannel);
        await guildData.delete(interaction.guild.id);

        await player.stop();
        await connection.destroy();

    };

};
module.exports.pause = async (options = {}) => {

    const { interaction } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });

    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = guildData.get(interaction.guild.id);
    const player = fetchedData.player;

    if (player.state.status === 'paused') return eventEmitter.emit("error", { errorCode: "ALREADY_PAUSED", errorMsg: `The song is already paused, check this with the isPaused() function.` });

    player.pause();

}
module.exports.isPaused = async (options = {}) => {

    const { interaction } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });

    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = guildData.get(interaction.guild.id);
    const player = fetchedData.player;

    if (player.state.status === 'paused') return Boolean(true)
    else return Boolean(false)

}
module.exports.resume = async (options = {}) => {

    const { interaction } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });

    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = guildData.get(interaction.guild.id);
    const player = fetchedData.player;

    if (player.state.status === 'playing') return eventEmitter.emit("error", { errorCode: "ALREADY_RESUMED", errorMsg: `The song is already playing, check this with the isResumed() function.` });

    player.unpause();

}
module.exports.isResumed = async (options = {}) => {

    const { interaction } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });

    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = guildData.get(interaction.guild.id);
    const player = fetchedData.player;

    if (player.state.status === 'playing') return Boolean(true)
    else return Boolean(false)

}
module.exports.jump = async (options = {}) => {

    const { interaction, number } = options
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });
    if (!number) return eventEmitter.emit("error", { errorCode: "INVALID_NUMBER", errorMsg: `There is no valid Number provided.` });

    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = await guildData.get(interaction.guild.id);

    if (number > fetchedData.queue.length) return eventEmitter.emit("error", { errorCode: "TO_HIGH_NUMBER", errorMsg: `The number is higher than the queue length.` });

    await fetchedData.queue.splice(0, number);
    guildData.set(interaction.guild.id, fetchedData);

    playSong(guildData.get(interaction.guild.id), interaction);

}
module.exports.getQueue = async (options = {}) => {

    const { interaction } = options
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });
    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = await guildData.get(interaction.guild.id);

    return (fetchedData.queue);

};
module.exports.removeQueue = async (options = {}) => {

    const { interaction, number } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });
    if (!number || !Number.isInteger(number)) return eventEmitter.emit("error", { errorCode: "INVALID_NUMBER", errorMsg: `There is no valid Number provided.` });

    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = await guildData.get(interaction.guild.id);
    if (fetchedData.queue.length < number) return eventEmitter.emit("error", { errorCode: "TO_HIGH_NUMBER", errorMsg: `The number is higher than the queue length.` });

    const spliceNumber = number - 1;
    fetchedData.queue.splice(spliceNumber, 1);

};
module.exports.volume = async (options = {}) => {

    const { interaction, volume } = options;
    if (!interaction) return eventEmitter.emit("error", { errorCode: "INVALID_INTERACTION", errorMsg: `There is no valid interaction provided.` });
    if (!volume || !Number.isInteger(volume) || volume > 100) return eventEmitter.emit("error", { errorCode: "INVALID_VOLUME", errorMsg: `There is no valid Volume Integer provided or the number is higher than 100.` });
    if (!guildData.has(interaction.guild.id) || !guildData.get(interaction.guild.id)?.connection || !guildData.get(interaction.guild.id)?.player) return eventEmitter.emit("error", { errorCode: "NO_MUSIC", errorMsg: `There is no music playing in that server.` });

    const fetchedData = await guildData.get(interaction.guild.id);

    fetchedData.resource.volume.setVolume(volume)

};


async function finishedSong(player, connection, dispatcher, interaction) {

    const fetchedData = await guildData.get(dispatcher.guildId);

    if (fetchedData?.repeat === true) return playSong(fetchedData, interaction)

    await fetchedData.queue.shift();

    if (fetchedData.queue.length > 0) {

        guildData.set(dispatcher.guildId, fetchedData);

        playSong(fetchedData, interaction)

    } else {

        eventEmitter.emit('finish', interaction.channel);

        guildData.delete(dispatcher.guildId);

        player.stop();
        setTimeout(() => {
            connection.destroy();
        }, 1000);

    };

}

async function playSong(data, interaction) {

    let resource = await createAudioResource(ytdl(data.queue[0].url, { filter: 'audioonly' }), {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
    });

    const player = createAudioPlayer();

    player.play(resource);

    data.player = player;
    data.resource = resource
    data.dispatcher = await data.connection.subscribe(player);
    data.dispatcher.guildId = data.guildId;

    if (data.queue[0].info.extra.type === 'playlist') {
        eventEmitter.emit('playList', data.queue[0].channel, data.queue[0].info.extra.playlist, data.queue[0].info, data.queue[0].requester);
    } else {
        eventEmitter.emit('playSong', data.queue[0].channel, data.queue[0].info, data.queue[0].requester);
    }

    player.on(AudioPlayerStatus.Idle, async () => {
        finishedSong(player, data.connection, data.dispatcher, interaction);
    })

    player.on('error', err => console.log(err))
}
function isURL(input) {
    if (typeof input !== "string" || input.includes(" "))
        return false;
    try {
        const url = new url_1.URL(input);
        if (!["https:", "http:"].includes(url.protocol) || !url.host)
            return false;
    }
    catch {
        return false;
    }
    return true;
}
async function connectToChannel(channel) {
    return new Promise(async (resolve, reject) => {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true
        });
        connection.once(VoiceConnectionStatus.Ready, () => {
            resolve(connection)
        })
        await delay(30000)
        reject('Connection was failed to connect to VC')
    })
}
const formatInt = (int) => (int < 10 ? `0${int}` : int);

function formatDuration(sec) {
    if (!sec || !Number(sec))
        return "00:00";
    const seconds = Math.round(sec % 60);
    const minutes = Math.floor((sec % 3600) / 60);
    const hours = Math.floor(sec / 3600);
    if (hours > 0)
        return `${formatInt(hours)}:${formatInt(minutes)}:${formatInt(seconds)}`;
    if (minutes > 0)
        return `${formatInt(minutes)}:${formatInt(seconds)}`;
    return `00:${formatInt(seconds)}`;
}