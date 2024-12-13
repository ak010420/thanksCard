const axios = require('axios');
const fs = require('fs');
const TOKEN_PATH = './access_token.json';

async function getAccessToken() {
    // キャッシュからトークンを取得
    if (fs.existsSync(TOKEN_PATH)) {
        const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        if (new Date(tokenData.expiry) > new Date()) {
            return tokenData.token;
        }
    }

    // アクセストークンを取得
    const response = await axios.post('https://auth.worksmobile.com/oauth2/v2.0/token', null, {
        params: {
            grant_type: 'client_credentials',
            client_id: process.env.LW_API_CLIENT_ID,
            client_secret: process.env.LW_API_CLIENT_SECRET,
            scope: 'bot'
        }
    });

    const token = response.data.access_token;
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + response.data.expires_in);

    // キャッシュに保存
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({ token, expiry }));

    return token;
}

exports.handleBotEvent = async (req, res) => {
    const event = req.body;
    if (event.type === 'message') {
        const { content, userId } = event;
        if (content.text === 'ありがとうの木投稿') {
            const token = await getAccessToken();
            await sendReply(userId, '投稿ページはこちら: https://example.com/woff', token);
        }
    }
    res.status(200).send('Event received');
};

async function sendReply(userId, text, token) {
    await axios.post('https://apis.worksmobile.com/r/api/bot/message', {
        botId: process.env.LW_BOT_ID,
        accountId: userId,
        content: { type: 'text', text },
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

module.exports = { handleBotEvent, getAccessToken };
