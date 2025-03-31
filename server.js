const express = require('express');
const app = express();
app.use(express.json());

const connectedUsers = {}; // { username: { userId, command, lastSeen, placeId, jobId } }
const blacklist = new Set();

app.post('/connect', (req, res) => {
  const { username, userId, placeId, jobId } = req.body;
  connectedUsers[username] = {
    userId,
    command: blacklist.has(username) ? 'blacklist' : null,
    lastSeen: Date.now(),
    placeId,
    jobId
  };
  res.sendStatus(200);
});

app.get('/command/:username', (req, res) => {
  const username = req.params.username;
  const user = connectedUsers[username];
  if (!user) return res.json({ command: null });
  user.lastSeen = Date.now();
  const command = user.command;
  user.command = null;
  res.json({ command });
});

app.get('/users', (req, res) => {
  const now = Date.now();
  const activeUsers = Object.entries(connectedUsers)
    .filter(([_, user]) => now - user.lastSeen < 60000)
    .map(([name]) => name);
  res.json(activeUsers);
});

app.get('/gameinfo/:username', (req, res) => {
  const user = connectedUsers[req.params.username];
  if (user && user.placeId && user.jobId) {
    res.json({ placeId: user.placeId, jobId: user.jobId });
  } else {
    res.status(404).json({ error: 'User not found or missing data' });
  }
});

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
createCommandRoute('bansb', 'bansb');

app.post('/notif', (req, res) => {
  const { username, text } = req.body;
  const user = connectedUsers[username];
  if (user) {
    user.command = { type: 'notif', text };
    return res.json({ success: true });
  }
  res.json({ success: false });
});

app.listen(3000, () => {
  console.log('✅ Serveur en ligne sur le port 3000');
});
