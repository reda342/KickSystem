// ✅ bot.js complet avec commande /bansb (Slap Battles)
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = '1331382428987822180';
const API_URL = 'https://kicksystem.onrender.com';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder().setName('user').setDescription('Voir les utilisateurs connectés'),

  new SlashCommandBuilder().setName('kick').setDescription('Kick un joueur').addStringOption(option => option.setName('username').setDescription('Nom du joueur').setRequired(true)),

  new SlashCommandBuilder().setName('mute').setDescription('Mute un joueur').addStringOption(option => option.setName('username').setDescription('Nom du joueur').setRequired(true)),

  new SlashCommandBuilder().setName('unmute').setDescription('Unmute un joueur').addStringOption(option => option.setName('username').setDescription('Nom du joueur').setRequired(true)),

  new SlashCommandBuilder().setName('freeze').setDescription('Freeze un joueur').addStringOption(option => option.setName('username').setDescription('Nom du joueur').setRequired(true)),

  new SlashCommandBuilder().setName('unfreeze').setDescription('Unfreeze un joueur').addStringOption(option => option.setName('username').setDescription('Nom du joueur').setRequired(true)),

  new SlashCommandBuilder().setName('notif').setDescription('Envoie une notification à un joueur').addStringOption(option => option.setName('username').setDescription('Nom du joueur').setRequired(true)).addStringOption(option => option.setName('text').setDescription('Texte de la notif').setRequired(true)),

  new SlashCommandBuilder().setName('blacklist').setDescription('Blacklist un joueur (kick auto à chaque reco)').addStringOption(option => option.setName('username').setDescription('Nom du joueur').setRequired(true)),

  new SlashCommandBuilder().setName('unblacklist').setDescription('Retire un joueur de la blacklist').addStringOption(option => option.setName('username').setDescription('Nom du joueur').setRequired(true)),

  new SlashCommandBuilder().setName('bansb').setDescription('Ban SB (envoie script personnalisé)').addStringOption(option => option.setName('username').setDescription('Nom du joueur').setRequired(true))
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
      const msg = users.length === 0 ? 'Aucun utilisateur connecté.' : users.map(u => `**${u}** - connected`).join('\n');
      await interaction.reply(msg);
    } catch (err) {
      if (!interaction.replied) await interaction.reply('❌ Erreur serveur.');
    }
  }

  if (["kick","mute","unmute","freeze","unfreeze","blacklist","unblacklist","bansb"].includes(interaction.commandName)) {
    try {
      const res = await axios.post(`${API_URL}/${interaction.commandName}`, { username });
      const msg = res.data.success ? `✅ **${username}** a reçu la commande \`${interaction.commandName}\`.` : `❌ L'utilisateur **${username}** n'est pas connecté.`;
      await interaction.reply(msg);
    } catch (err) {
      if (!interaction.replied) await interaction.reply('❌ Erreur serveur.');
    }
  }

  if (interaction.commandName === 'notif') {
    const text = interaction.options.getString('text');
    try {
      const res = await axios.post(`${API_URL}/notif`, { username, text });
      const msg = res.data.success ? `✅ Notification envoyée à **${username}**.` : `❌ Utilisateur **${username}** non connecté.`;
      await interaction.reply(msg);
    } catch (err) {
      if (!interaction.replied) await interaction.reply('❌ Erreur serveur.');
    }
  }
});

client.once('ready', () => {
  console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
});

client.login(TOKEN);
