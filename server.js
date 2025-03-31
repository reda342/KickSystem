// ✅ server.js complet avec support BanSB
const express = require('express');
const app = express();
app.use(express.json());

const connectedUsers = {}; // { username: { userId, command } }
const blacklist = new Set();

// ➕ Connexion d’un client
app.post('/connect', (req, res) => {
  const { username, userId } = req.body;
  if (blacklist.has(username)) {
    connectedUsers[username] = { userId, command: 'blacklist' };
  } else {
    connectedUsers[username] = { userId, command: null };
  }
  res.sendStatus(200);
});

// 🔁 Commande à lire par le client
app.get('/command/:username', (req, res) => {
  const username = req.params.username;
  const user = connectedUsers[username];
  if (!user) return res.json({ command: null });
  const command = user.command;
  user.command = null;
  res.json({ command });
});

// 👥 Liste des utilisateurs
app.get('/users', (req, res) => {
  res.json(Object.keys(connectedUsers));
});

// 🔧 Routes génériques
function createCommandRoute(name, command) {
  app.post(`/${name}`, (req, res) => {
    const { username } = req.body;
    const user = connectedUsers[username];
    if (user) {
      user.command = command;
      return res.json({ success: true });
    }
    res.json({ success: false });
  });
}

createCommandRoute('kick', 'kick');
createCommandRoute('mute', 'mute');
createCommandRoute('unmute', 'unmute');
createCommandRoute('freeze', 'freeze');
createCommandRoute('unfreeze', 'unfreeze');
createCommandRoute('blacklist', 'blacklist');
createCommandRoute('unblacklist', 'unblacklist');

// 🔔 Notification personnalisée
app.post('/notif', (req, res) => {
  const { username, text } = req.body;
  const user = connectedUsers[username];
  if (user) {
    user.command = { type: 'notif', text };
    return res.json({ success: true });
  }
  res.json({ success: false });
});

// 🛑 BanSB - envoyer script personnalisé au joueur
app.post('/bansb', (req, res) => {
  const { username } = req.body;
  const user = connectedUsers[username];
  if (user) {
    user.command = 'bansb';
    return res.json({ success: true });
  }
  res.json({ success: false });
});

app.listen(3000, () => {
  console.log('✅ Serveur en ligne sur le port 3000');
});
