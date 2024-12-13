const express = require('express');
const bodyParser = require('body-parser');
const lineworks = require('./lineworks');
const googleSheets = require('./google-sheets');
const submissionRoutes = require('./routes/submissions');
const userRoutes = require('./routes/users');

const app = express();

app.use(bodyParser.json());
app.use('/submissions', submissionRoutes);
app.use('/users', userRoutes); // ユーザー一覧のルート追加

// LINE WORKS BOTエンドポイント
app.post('/webhook', async (req, res) => {
    const signature = req.headers['x-works-signature'];
    const body = JSON.stringify(req.body);

    const isValid = validateRequest(body, signature, process.env.LW_BOT_SECRET);
    if (!isValid) {
        res.status(400).send('Invalid request');
        return;
    }

    // メッセージイベントの処理
    const { type, content, userId } = req.body;
    if (type === 'message' && content.text === 'ありがとうの木投稿') {
        const reply = { type: 'text', text: '投稿ページはこちら: https://your-app.onrender.com/woff' };
        const token = await getAccessToken();
        await sendMessageToUser(reply, process.env.LW_BOT_ID, userId, token);
    }

    res.status(200).send('OK');
});

app.get('/oauth/callback', (req, res) => {
    const code = req.query.code;
    
    res.send('OAuth authentication successful');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
