require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require("axios");
const fs = require('fs').promises;

const TOKEN_PATH = './access_token.json'; // アクセストークンキャッシュ用

// JWTを生成
function getJWT() {
    const currentTime = Math.floor(Date.now() / 1000);
    if (!process.env.TC_CLIENT_ID || !process.env.TC_SERVICE_ACCOUNT || !process.env.TC_PRIVATE_KEY) {
        throw new Error("環境変数 CLIENT_ID, SERVICE_ACCOUNT, PRIVATE_KEY を設定してください");
    }

    // 改行文字を適切に処理
    const privateKey = process.env.TC_PRIVATE_KEY.replace(/\\n/g, '\n')
        .replace(/^["|']/, '')
        .replace(/["|']$/, '')
        .trim();

    // RSA形式の秘密鍵であることを確認
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        throw new Error('PRIVATE_KEY is not in the correct format. It should start with "-----BEGIN PRIVATE KEY-----"');
    }

    return jwt.sign(
        {
            iss: process.env.TC_CLIENT_ID,
            sub: process.env.TC_SERVICE_ACCOUNT,
            iat: currentTime,
            exp: currentTime + 3600,
        },
        privateKey,
        { algorithm: "RS256" }
    );
}

// キャッシュチェック
async function readTokenCache() {
    try {
        const tokenData = await fs.readFile(TOKEN_PATH, 'utf8');
        const parsedData = JSON.parse(tokenData);
        
        if (tokenData && new Date(tokenData.expiry) > new Date()) {
            return tokenData.token;
        }
    } catch (error) {
        console.error('トークンキャッシュの読み込みエラー:', error.message);
    }
    return null;
}

// アクセストークンと有効期限をキャッシュに保存
async function writeTokenCache(token, expiresIn) {
    const tokenData = {
        token,
        expiry: new Date(Date.now() + expiresIn * 1000), // 現在時刻 + 有効期限
    };
    
    console.log('保存するトークンデータ:', tokenData);
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokenData, null, 2)); // 非同期でJSONを整形して保存
}

// アクセストークン取得
async function getAccessToken() {
    const cachedToken = await readTokenCache();
    if (cachedToken) {
        console.log('使用中のキャッシュトークン:', cachedToken);
        return cachedToken;
    }

    try {
        const jwtToken = getJWT();
        const params = new URLSearchParams({
            assertion: jwtToken,
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            client_id: process.env.TC_CLIENT_ID,
            client_secret: process.env.TC_CLIENT_SECRET,
            scope: "bot,user.read",
        });

        const res = await axios.post("https://auth.worksmobile.com/oauth2/v2.0/token", params);

        await writeTokenCache(res.data.access_token, res.data.expires_in);
        console.log('新しいアクセストークン取得成功:', res.data.access_token);
        return res.data.access_token;
    } catch (error) {
        console.error('アクセストークンの取得に失敗しました:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// 固定メニュー実装
async function setFixedMenu() {
    try {
        // アクセストークン取得
        const accessToken = await getAccessToken();

        const botId = process.env.TC_BOT_ID;
        const webAppUrl = process.env.TC_WEBAPP_URL;

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
                        "uri": webAppUrl
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
        }
        console.error('固定メニュー設定エラー (Generic):', error.message);
        throw error;
    }
}

// ユーザー一覧取得
async function getUserList() {
    try {
        const token = await getAccessToken();
        console.log('ユーザーリスト取得中');

        const response = await axios.get('https://www.worksapis.com/v1.0/users', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data.users || response.data.users.length === 0) {
            console.log('ユーザーが見つかりませんでした。');
            return [];
        }

        // ユーザー数のみをコンソールに出力
        console.log(`ユーザー数: ${response.data.users.length}`);

        // ユーザー情報を整形して返す
        return response.data.users.map(user => {
            // userNameが存在する場合はlastNameとfirstNameを結合
            const userName = user.userName
                ? `${user.userName.lastName || ''} ${user.userName.firstName || ''}`.trim()
                : '名前未設定';

            return {
                id: user.userId,
                name: userName,
            };
        });
    } catch (error) {
        console.error('ユーザーリスト取得エラー:', error.message);
        throw error;
    }
}

module.exports = { getAccessToken, getUserList, setFixedMenu };
