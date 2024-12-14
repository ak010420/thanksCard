require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require("axios");
const fs = require('fs');

const TOKEN_PATH = './access_token.json'; // アクセストークンキャッシュ用

// JWTを生成
function getJWT() {
    const currentTime = Math.floor(Date.now() / 1000);
    if (!process.env.CLIENT_ID || !process.env.SERVICE_ACCOUNT || !process.env.PRIVATE_KEY) {
        throw new Error("環境変数 CLIENT_ID, SERVICE_ACCOUNT, PRIVATE_KEY を設定してください");
    }

    return jwt.sign(
        {
            iss: process.env.CLIENT_ID,
            sub: process.env.SERVICE_ACCOUNT,
            iat: currentTime,
            exp: currentTime + 3600,
        },
        process.env.PRIVATE_KEY,
        { algorithm: "RS256" }
    );
}

// アクセストークン取得
async function getAccessToken() {
    // キャッシュチェック
    if (fs.existsSync(TOKEN_PATH)) {
        const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        if (new Date(tokenData.expiry) > new Date()) {
            return tokenData.token;
        }
    }

    const jwtToken = getJWT();

    const params = new URLSearchParams({
        assertion: jwtToken,
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        scope: "bot,user.read",
    });

    const res = await axios.post("https://auth.worksmobile.com/oauth2/v2.0/token", params);

    // アクセストークンと有効期限をキャッシュに保存
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({
        token: res.data.access_token,
        expiry: new Date(Date.now() + res.data.expires_in * 1000), // 現在時刻 + 有効期限
    }));

    return res.data.access_token;
}

//固定メニュー実装
async function setFixedMenu() {
    try {
        // アクセストークン取得
        const accessToken = await getAccessToken();

        const botId = process.env.BOT_ID;
        if (!botId || !process.env.WEBAPP_URL) {
            throw new Error("環境変数 BOT_ID, WEBAPP_URL を設定してください");
        }

        // 固定メニュー設定のAPIエンドポイント
        const apiUrl = `https://www.worksapis.com/v1.0/bots/${botId}/persistentmenu`;
        
        // メニュー設定の詳細
        const menuConfig = {
            "content": {
                "actions": [
                    {
                        "type": "uri",
                        "label": "ありがとうの木を投稿する",
                        "uri": process.env.WEBAPP_URL
                    }
                ]
            }
        };

        // API呼び出し
        const response = await axios.post(apiUrl, menuConfig, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('固定メニューを正常に設定:', response.data);
        return response.data;

    } catch (error) {
        console.error('固定メニュー設定エラー:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// ユーザー一覧取得
async function getUserList() {
    const token = await getAccessToken(); // 必要なトークンを取得
    const response = await axios.get('https://apis.worksmobile.com/r/api/organization/users', {
        headers: { Authorization: `Bearer ${token}` },
    });

    // ユーザー情報を整形して返す
    return response.data.users.map(user => ({
        id: user.id,
        name: user.name,
    }));
}

module.exports = { getAccessToken, getUserList };