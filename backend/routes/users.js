const express = require('express');
const axios = require('axios');
const { getAccessToken } = require('../lineworks');

const router = express.Router();

// ユーザー情報を取得するエンドポイント
router.get('/', async (req, res) => {
    try {
        // アクセストークンの取得
        const token = await getAccessToken();
        if (!token) {
            throw new Error('Failed to retrieve access token');
        }

        // ユーザー情報を取得するAPIリクエスト
        const response = await axios.get('https://apis.worksmobile.com/r/api/organization/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Users response:', response.data); // レスポンスの確認

        // ユーザー情報のマッピング
        const users = response.data.users.map(user => ({
            id: user.id,
            name: user.name,
        }));

        // ユーザー情報をレスポンスとして返す
        res.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error.message);
        // エラーハンドリング強化: 詳細メッセージを返す
        res.status(500).json({ error: `Failed to fetch users: ${error.message}` });
    }
});

module.exports = router;
