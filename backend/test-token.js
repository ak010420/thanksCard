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

testAccessToken();