require('dotenv').config();
const lineworks = require('./lineworks');

async function testAccessToken() {
    try {
        const token = await lineworks.getAccessToken();
        console.log('Access Token:', token);
        console.log('Token length:', token.length);
        console.log('CLIENT_ID:', process.env.CLIENT_ID);
        console.log('SERVICE_ACCOUNT:', process.env.SERVICE_ACCOUNT);
        console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.slice(0, 30) + '...' : 'PRIVATE_KEY is undefined');
        console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET);

    } catch (error) {
        console.error('Error obtaining access token:', error);
    }
}

(async () => {
    const lineworks = require('./lineworks');
    try {
        await lineworks.setFixedMenu();
        console.log('固定メニューが正常に設定されました。');
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
})();

testAccessToken();