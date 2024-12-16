require('dotenv').config();
const lineworks = require('./lineworks');

async function testAccessToken() {
    try {
        const token = await lineworks.getAccessToken();
        console.log('Access Token:', token);
        console.log('Token length:', token.length);
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
        console.error('固定メニューの設定に失敗しました。');
    }
})();


testAccessToken();