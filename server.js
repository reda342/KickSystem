const express = require('express');
const app = express();
app.use(express.json());

const connectedUsers = {}; // { username: { userId, command } }

app.post('/connect', (req, res) => {
    const { username, userId } = req.body;
    connectedUsers[username] = { userId, command: null };
    res.sendStatus(200);
});

app.get('/command/:username', (req, res) => {
    const user = connectedUsers[req.params.username];
    if (!user) return res.json({ command: null });

    const command = user.command;
    user.command = null; // Reset après envoi
    res.json({ command });
});

app.post('/kick', (req, res) => {
    const { username } = req.body;
    if (connectedUsers[username]) {
        connectedUsers[username].command = "kick";
        return res.json({ success: true });
    }
    res.json({ success: false, error: "User not connected" });
});

app.get('/users', (req, res) => {
    res.json(Object.keys(connectedUsers));
});

app.listen(3000, () => console.log('✅ Serveur prêt sur le port 3000'));
