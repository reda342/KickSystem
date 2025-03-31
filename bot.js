const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = '1331382428987822180';
const API_URL = 'https://kicksystem.onrender.com';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('user')
    .setDescription('Voir les utilisateurs connectés'),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick un utilisateur')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Nom du joueur')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('notif')
    .setDescription('Envoie une notification à un joueur')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Nom du joueur')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Texte de la notif')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute le chat d’un joueur')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Nom du joueur')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('freeze')
    .setDescription('Freeze le joueur (il peut plus bouger)')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Nom du joueur')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist un joueur (il sera auto-kick)')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Nom du joueur')
        .setRequired(true))
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Commandes slash enregistrées.');
  } catch (err) {
    console.error('❌ Erreur en enregistrant les commandes:', err);
  }
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const username = interaction.options.getString('username');

  if (interaction.commandName === 'user') {
    try {
      const res = await axios.get(`${API_URL}/users`);
      const users = res.data;
      if (users.length === 0) return interaction.reply('Aucun utilisateur connecté.');
      interaction.reply(users.map(u => `**${u}** - connected`).join('\n'));
    } catch (err) {
      interaction.reply('❌ Erreur en récupérant les utilisateurs.');
    }
  }

  if (['kick', 'mute', 'freeze', 'blacklist'].includes(interaction.commandName)) {
    try {
      const res = await axios.post(`${API_URL}/${interaction.commandName}`, { username });
      if (res.data.success) {
        interaction.reply(`✅ **${username}** a reçu la commande \`${interaction.commandName}\`.`);
      } else {
        interaction.reply(`❌ L'utilisateur **${username}** n'est pas connecté.`);
      }
    } catch (err) {
      interaction.reply('❌ Erreur lors de l\'envoi de la commande.');
    }
  }

  if (interaction.commandName === 'notif') {
    const text = interaction.options.getString('text');
    try {
      const res = await axios.post(`${API_URL}/notif`, { username, text });
      if (res.data.success) {
        interaction.reply(`✅ Notification envoyée à **${username}**.`);
      } else {
        interaction.reply(`❌ Utilisateur **${username}** non connecté.`);
      }
    } catch (err) {
      interaction.reply('❌ Erreur lors de l\'envoi de la notification.');
    }
  }
});

client.once('ready', () => {
  console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
});

client.login(TOKEN);
