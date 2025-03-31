const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const TOKEN = 'MTMzMTM4MjQyODk4NzgyMjE4MA.G-olBa.pW1W_RF00cKcZD6dTuqIlVs12YzVSRUhb6NRR8';
const CLIENT_ID = '1331382428987822180';
const API_URL = 'http://192.168.1.51:3000';

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

    if (interaction.commandName === 'kick') {
        const username = interaction.options.getString('username');
        try {
            const res = await axios.post(`${API_URL}/kick`, { username });
            if (res.data.success) {
                interaction.reply(`✅ **${username}** a été kick avec succès.`);
            } else {
                interaction.reply(`❌ L'utilisateur **${username}** n'est pas connecté.`);
            }
        } catch (err) {
            interaction.reply('❌ Erreur lors de l\'envoi de la commande.');
        }
    }
});

client.once('ready', () => {
    console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
});

client.login(TOKEN);
