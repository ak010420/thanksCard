const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const lineworks = require('./lineworks');
const submissionRoutes = require('./routes/submissions');
const userRoutes = require('./routes/users');

// CORS対応
app.use(cors());

// ミドルウェア設定
const app = express();
app.use(bodyParser.json());
app.use(compression()); // リソースを圧縮
app.use(express.static(path.join(__dirname, '../frontend'), { maxAge: '1d' })); // 1日のキャッシュ
app.use(express.static(path.join(__dirname, '../frontend')));

// ルーティング
app.use('/submissions', submissionRoutes);
app.use('/users', userRoutes);

// WOFFイベントのエンドポイント
app.post('/woff/event', (req, res) => {
    const start = Date.now();
    console.log('Request received at:', new Date().toISOString());

    const { type, data } = req.body;

    if (type === 'user.select') {
        console.log('User selected:', data);
    } else if (type === 'menu.click') {
        console.log('Menu clicked:', data);
    } else {
        console.log('Unknown WOFF event type:', type);
    }

    res.status(200).send('Event received');
    console.log('Response sent in:', Date.now() - start, 'ms');
});


// フロントエンドのHTML提供
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// WOFF IDを返すAPIエンドポイント
app.get('/api/woff-id', (req, res) => {
    res.json({ woffId: process.env.WOFF_ID });
});

const PORT = process.env.TC_PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
