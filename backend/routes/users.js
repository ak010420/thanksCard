const express = require('express');
const { getAccessToken, getUserList } = require('../lineworks');
const axios = require('axios');

const router = express.Router();

// WOFF IDを返すエンドポイント
router.get('/woff-id', (req, res) => {
    res.json({ woffId: process.env.TC_WOFF_ID });
});

// ユーザーリスト取得エンドポイント
router.get('/', async (req, res) => {
    try {
        const users = await getUserList();
        res.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error.message);
        res.status(500).json({ error: `Failed to fetch users: ${error.message}` });
    }
});

// 現在のユーザー名を取得するエンドポイント
router.post('/current', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'UserId is required' });
        }

        const token = await getAccessToken();
        const response = await axios.get(`https://www.worksapis.com/v1.0/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const username = response.data.name || 'Unknown User';
        res.json({ username });
    } catch (error) {
        console.error('Failed to fetch current user:', error.message);
        res.status(500).json({ error: `Failed to fetch current user: ${error.message}` });
    }
});

module.exports = router;