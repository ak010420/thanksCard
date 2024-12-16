const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const lineworks = require('./lineworks');
const submissionRoutes = require('./routes/submissions');
const userRoutes = require('./routes/users');
const cors = require('cors');

const app = express();

// CORS対応
app.use(cors());

// ミドルウェア設定
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
    try {
        const woffId = process.env.TC_WOFF_ID;
        if (!woffId) {
            return res.status(404).json({ message: 'WOFF ID が見つかりませんでした' });
        }
        res.json({ woffId });
    } catch (error) {
        console.error('WOFF ID 取得エラー:', error.message);
        res.status(502).json({ 
            error: 'Bad Gateway', 
            details: 'WOFF ID の取得に失敗しました。' 
        });
    }
});

// エラーハンドリングを追加
app.use((err, req, res, next) => {
    res.on('finish', () => {
        console.log(`Response: ${res.statusCode} ${res.statusMessage}`);
    });
    next();
    console.error('Unhandled Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        details: err.message 
    });
});

app.use(cors({
    origin: 'https://thanks-card-system.onrender.com', // フロントエンドのURL
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.TC_PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔑 WOFF ID: ${process.env.TC_WOFF_ID}`);
});
