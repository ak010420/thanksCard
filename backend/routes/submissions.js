const express = require('express');
const { addSubmission, getSubmissions, getAllSubmissions } = require('../models/submission');

const router = express.Router();

// 提出データ追加エンドポイント
router.post('/', async (req, res) => {
    const { sender, receiver, date, content } = req.body;
    
    // 送信データが不足している場合はエラーを返す
    if (!sender || !receiver || !date || !content) {
        return res.status(400).json({ error: '送信者、受信者、日付、内容のすべてが必要です。' });
    }

    try {
        await addSubmission({ sender, receiver, date, content });
        res.status(201).json({ message: '提出データが追加されました' });
    } catch (error) {
        console.error('提出データ追加エラー:', error.message);
        res.status(500).json({ error: '提出データの追加に失敗しました。' });
    }
});

// ユーザーIDに基づいて提出データを取得するエンドポイント
router.get('/:userId', async (req, res) => {
    const { filter } = req.query;
    
    try {
        const submissions = await getSubmissions(req.params.userId, filter);
        if (!submissions || submissions.length === 0) {
            return res.status(404).json({ message: '提出データが見つかりませんでした' });
        }
        res.json(submissions);
    } catch (error) {
        console.error('提出データ取得エラー:', error.message);
        res.status(500).json({ 
            error: '提出データの取得に失敗しました。' 
        });
    }
});

// すべての提出データを取得するエンドポイント
router.get('/:userId', async (req, res) => {
    const { filter } = req.query;

    try {
        const submissions = await getSubmissions(req.params.userId, filter);
        res.json(submissions);
    } catch (error) {
        console.error('履歴データ取得エラー:', error.message);
        res.status(500).json({ error: '履歴データの取得に失敗しました。' });
    }
});

module.exports = router;