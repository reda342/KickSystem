const express = require('express');
const app = express();
app.use(express.json());

const connectedUsers = {}; // { username: { userId, command } }
const blacklist = new Set(); // utilisateurs blacklistés

// ➕ Connexion d’un client
app.post('/connect', (req, res) => {
  const { username, userId } = req.body;

  if (blacklist.has(username)) {
    connectedUsers[username] = { userId, command: "blacklist" };
  } else {
    connectedUsers[username] = { userId, command: null };
  }

  res.sendStatus(200);
});

// 🔁 Récupère la commande pour un joueur
app.get('/command/:username', (req, res) => {
  const username = req.params.username;
  const user = connectedUsers[username];

  if (!user) return res.json({ command: null });

  const command = user.command;
  user.command = null; // reset après envoi
  res.json({ command });
});

// 👥 Liste des utilisateurs connectés
app.get('/users', (req, res) => {
  res.json(Object.keys(connectedUsers));
});

// 🔧 Commande générique
function registerCommandRoute(path, commandName) {
  app.post(`/${path}`, (req, res) => {
    const { username } = req.body;
    const user = connectedUsers[username];
    if (user) {
      user.command = commandName;
      return res.json({ success: true });
    }
    res.json({ success: false, error: "User not connected" });
  });
}

// ➕ Commandes de base
registerCommandRoute('kick', 'kick');
registerCommandRoute('mute', 'mute');
registerCommandRoute('unmute', 'unmute');
registerCommandRoute('freeze', 'freeze');
registerCommandRoute('unfreeze', 'unfreeze');

// 🔕 Notification personnalisée
app.post('/notif', (req, res) => {
  const { username, text } = req.body;
  const user = connectedUsers[username];
  if (user) {
    user.command = {
      type: 'notif',
      text: text
    };
    return res.json({ success: true });
  }
  res.json({ success: false, error: "User not connected" });
});

// ⛔ Blacklist
app.post('/blacklist', (req, res) => {
  const { username } = req.body;
  blacklist.add(username);
  const user = connectedUsers[username];
  if (user) {
    user.command = "blacklist";
  }
  res.json({ success: true });
});

// ✅ Unblacklist
app.post('/unblacklist', (req, res) => {
  const { username } = req.body;
  if (blacklist.has(username)) {
    blacklist.delete(username);
    return res.json({ success: true });
  }
  res.json({ success: false, error: "User not in blacklist" });
});

app.listen(3000, () => {
  console.log('✅ Serveur prêt sur le port 3000');
});
