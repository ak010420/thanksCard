const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const lineworks = require('./lineworks');
const submissionRoutes = require('./routes/submissions');
const userRoutes = require('./routes/users');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/submissions', submissionRoutes);
app.use('/users', userRoutes);

// WOFFイベントのエンドポイント
app.post('/woff/event', (req, res) => {
    const { type, data } = req.body;

    if (type === 'user.select') {
        console.log('User selected:', data);
    } else if (type === 'menu.click') {
        console.log('Menu clicked:', data);
    } else {
        console.log('Unknown WOFF event type:', type);
    }

    res.status(200).send('Event received');
});

// フロントエンドのHTML提供
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// WOFF IDを返すAPIエンドポイント
app.get('/api/woff-id', (req, res) => {
    res.json({ woffId: process.env.WOFF_ID });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
