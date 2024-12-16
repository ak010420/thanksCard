const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const lineworks = require('./lineworks');
const { setFixedMenu } = require('./lineworks');
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

// 固定メニュー設定 (サーバー起動時に実行)
(async () => {
    try {
        await setFixedMenu();
        console.log('固定メニューが正常に設定されました');
    } catch (error) {
        console.error('固定メニュー設定エラー:', error.message);
    }
})();

// WOFFイベントのエンドポイント
app.post('/woff/event', async(req, res) => {
    //const start = Date.now();
    //console.log('Request received at:', new Date().toISOString());

    const { type, data } = req.body;

    try {
        if (type === 'user.select') {
            const userId = data.source?.userId;

            if (!userId) {
                return res.status(400).send('UserId not found');
            }

            const response = await axios.post('http://localhost:3000/users/current', { userId });
            res.status(200).json({ message: 'User recognized', username: response.data.username });
        } else {
            res.status(400).send('Unknown event type');
        }
    } catch (error) {
        console.error('Error processing WOFF event:', error.message);
        res.status(500).json({ error: 'Failed to process event', details: error.message });
    }
});

// フロントエンドのHTML提供
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// エラーハンドリングを追加
// app.use((err, req, res, next) => {
//     res.on('finish', () => {
//         console.log(`Response: ${res.statusCode} ${res.statusMessage}`);
//     });
//     next();
//     console.error('Unhandled Error:', err);
//     res.status(500).json({ 
//         error: 'Internal Server Error', 
//         details: err.message 
//     });
// });

// app.use(cors({
//     origin: 'https://thanks-card-system.onrender.com', // フロントエンドのURL
//     methods: ['GET', 'POST', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

const PORT = process.env.TC_PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔑 WOFF ID: ${process.env.TC_WOFF_ID}`);
});