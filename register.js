import 'dotenv/config';
import { REST,Routes } from 'discord.js';

// Function to register commands
async function InstallGlobalCommands(appId, commands) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(appId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

const DOWNLOAD_COMMAND = {
  name: 'download',
  type: 1,
  description: 'Download a video or audio from a given URL.',
  options: [
    {
      type: 3,
      name: 'url',
      description: 'The URL of the video to download',
      required: true,
    },
    {
      type: 3,
      name: 'video-quality',
      description: 'The video quality to download',
      required: false,
      choices: [
        { name: '144', value: '144' },
        { name: '240', value: '240' },
        { name: '360', value: '360' },
        { name: '480', value: '480' },
        { name: '720', value: '720' },
        { name: '1440', value: '1440' },
        { name: '2160', value: '2160' },
        { name: '4320', value: '4320' },
        { name: 'Max', value: 'max' },
      ],
    },
    {
      type: 5,
      name: 'audio-only',
      description: 'Download audio only (true/false)',
      required: false,
    },
    {
      type: 5,
      name: 'mute-audio',
      description: 'Mute audio (true/false)',
      required: false,
    },
    {
      type: 5,
      name: 'twitter-gif',
      description: 'Download as Twitter GIF (true/false)',
      required: false,
    },
    {
      type: 5,
      name: 'tiktok-original-audio',
      description: 'Include TikTok original audio (true/false)',
      required: false,
    },
    {
      type: 3,
      name: 'audio-format',
      description: 'Format for audio',
      required: false,
      choices: [
        { name: 'MP3', value: 'mp3' },
        { name: 'OGG', value: 'ogg' },
        { name: 'WAV', value: 'wav' },
        { name: 'Best', value: 'best' },
      ],
    },
  ],
  integration_types: [1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [
  DOWNLOAD_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
