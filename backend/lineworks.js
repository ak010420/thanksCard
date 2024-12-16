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

    // 改行文字を適切に処理
    const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
        // 改行が正しく含まれていない場合の追加対応
        .replace(/^["|']/, '')
        .replace(/["|']$/, '')
        .trim();

    // RSA形式の秘密鍵であることを確認
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        throw new Error('PRIVATE_KEY is not in the correct format. It should start with "-----BEGIN PRIVATE KEY-----"');
    }

    return jwt.sign(
        {
            iss: process.env.CLIENT_ID,
            sub: process.env.SERVICE_ACCOUNT,
            iat: currentTime,
            exp: currentTime + 3600,
        },
        privateKey,
        { algorithm: "RS256" }
    );
}

// キャッシュチェック
function readTokenCache() {
    if (fs.existsSync(TOKEN_PATH)) {
        const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        if (new Date(tokenData.expiry) > new Date()) {
            return tokenData.token;
        }
    }
    return null;
}

// アクセストークンと有効期限をキャッシュに保存
function writeTokenCache(token, expiresIn) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({
        token,
        expiry: new Date(Date.now() + expiresIn * 1000),// 現在時刻 + 有効期限
    }, null, 2));// JSONを整形して保存
}

// アクセストークン取得
async function getAccessToken() {
    const cachedToken = readTokenCache();
    if (cachedToken) {
        return cachedToken;
    }

    try {
        const jwtToken = getJWT();
        const params = new URLSearchParams({
            assertion: jwtToken,
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            scope: "bot,user.read",
        });

        const res = await axios.post("https://auth.worksmobile.com/oauth2/v2.0/token", params);

        writeTokenCache(res.data.access_token, res.data.expires_in);
        console.log('Access Token obtained successfully');
        return res.data.access_token;
    } catch (error) {
        console.error('Failed to obtain access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

//固定メニュー実装
async function setFixedMenu() {
    try {
        // アクセストークン取得
        const accessToken = await getAccessToken();

        const botId = process.env.BOT_ID;
        const webAppUrl = process.env.WEBAPP_URL;

        if (!botId || !webAppUrl) {
            throw new Error("BOT_IDまたはWEBAPP_URLが設定されていません。環境変数を確認してください。");
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

        console.log("API URL:", apiUrl);
        console.log("Menu Config:", JSON.stringify(menuConfig, null, 2));

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
        if (error.response) {
            console.error('固定メニュー設定エラー (Response):', error.response.data);
            console.error('HTTP Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else {
            console.error('固定メニュー設定エラー:', error.message);
        }
        throw error;
    }
}

// ユーザー一覧取得
async function getUserList() {
    try {
        const token = await getAccessToken();
        console.log('Access Token for User List:', token);

        const response = await axios.get('https://apis.worksmobile.com/r/api/organization/users', {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data); // レスポンスを確認

        if (!response.data.users || response.data.users.length === 0) {
            console.warn('No users found in the API response.');
            return [];
        }

        // ユーザー情報を整形して返す
        return response.data.users.map(user => ({
            id: user.id,
            name: user.name,
        }));
    } catch (error) {
        console.error('Failed to fetch user list:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { getAccessToken, getUserList, setFixedMenu };