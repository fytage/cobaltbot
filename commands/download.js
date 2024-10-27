import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, InteractionCollector } from 'discord.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
    data: new SlashCommandBuilder()
        .setName('download')
        .setDescription('Download a video or audio from a given URL.')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL of the video to download')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('video-quality')
                .setDescription('The video quality to download')
                .addChoices(
                    { name: '144p', value: '144' },
                    { name: '240p', value: '240' },
                    { name: '360p', value: '360' },
                    { name: '480p', value: '480' },
                    { name: '720p', value: '720' },
                    { name: '1440p', value: '1440' },
                    { name: '2160p (4K)', value: '2160' },
                    { name: '4320p (8K)', value: '4320' },
                    { name: 'Max', value: 'max' }
                ))
        .addBooleanOption(option =>
            option.setName('audio-only')
                .setDescription('Download audio only (true/false)'))
        .addBooleanOption(option =>
            option.setName('mute-audio')
                .setDescription('Mute audio (true/false)'))
        .addBooleanOption(option =>
            option.setName('twitter-gif')
                .setDescription('Download as Twitter GIF (true/false)'))
        .addBooleanOption(option =>
            option.setName('tiktok-original-audio')
                .setDescription('Include TikTok original audio (true/false)'))
        .addStringOption(option =>
            option.setName('audio-format')
                .setDescription('Format for audio (Turn audio-only to true)')
                .addChoices(
                    { name: 'MP3', value: 'mp3' },
                    { name: 'OGG', value: 'ogg' },
                    { name: 'WAV', value: 'wav' },
                    { name: 'Best', value: 'best' }
                )),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        const videoQuality = interaction.options.getString('video-quality');
        const audioOnly = interaction.options.getBoolean('audio-only');
        const muteAudio = interaction.options.getBoolean('mute-audio');
        const twitterGif = interaction.options.getBoolean('twitter-gif');
        const tiktokOriginalAudio = interaction.options.getBoolean('tiktok-original-audio');
        const audioFormat = interaction.options.getString('audio-format');

        await interaction.deferReply();

        try {
            const response = await axios.post('https://api.cobalt.tools/api/json', {
                url: url,
                vQuality: videoQuality,
                isAudioOnly: audioOnly,
                isAudioMuted: muteAudio,
                twitterGif: twitterGif,
                isTTFullAudio: tiktokOriginalAudio,
                aFormat: audioFormat
            }, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Download')
                        .setEmoji('🔗')
                        .setStyle(ButtonStyle.Link)
                        .setURL(response.data.url),
                    new ButtonBuilder()
                        .setLabel('Get Embed Link')
                        .setEmoji('🔑')
                        .setStyle(ButtonStyle.Success)
                        .setCustomId('getEmbedLink')
                );

            await interaction.editReply({
                content: `## ✅ Done! \n🔗 Click on the button below to download now!\n-# [Hover here to see your URL](${response.data.url})`,
                components: [row]
            });

            interaction.client.on('interactionCreate', async i => {
                console.log('Interaction received:', i.customId);
            });

            const filter = i => i.customId === 'getEmbedLink' && i.user.id === i.user.id;
            const collector = new InteractionCollector(interaction.client, {
                filter,
                time: 60000,
                interactionType: 'MESSAGE_COMPONENT'
            });

            collector.on('collect', async i => {

                await i.deferReply({ ephemeral: true });

                try {
                    await i.editReply({
                        content: '✅ Embed link has been generated!'
                    });

                } catch (error) {
                    console.error('Error during button interaction:', error);
                    await i.editReply({
                        content: '❌ An error occurred. Please try again later.'
                    });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    console.log('No button interaction was collected.');
                }
            });

        } catch (error) {
            console.error('Error downloading file:', error);
            
            if (error.response && error.response.data) {
                const apiMessage = error.response.data.text;
                await interaction.editReply(`❌ ${apiMessage} Please try another quality in settings!`);
            } else {
                await interaction.editReply('❌ An error occurred while downloading the file. Please try again later.');
            }
        }
    }
};
