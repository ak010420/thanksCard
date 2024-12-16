const express = require('express');
const { addSubmission, getSubmissions, getAllSubmissions } = require('../models/submission');

const router = express.Router();

router.post('/', async (req, res) => {
    const { sender, receiver, date, content } = req.body;
    await addSubmission({ sender, receiver, date, content });
    res.status(201).json({ message: 'Submission added' });
});

router.get('/:userId', async (req, res) => {
    const { filter } = req.query;
    const submissions = await getSubmissions(req.params.userId, filter);
    res.json(submissions);
});

router.get('/all', async (req, res) => {
    res.json({ message: 'ダミー応答テスト中' });
    try {
        const submissions = await getAllSubmissions();
        if (!submissions) {
            return res.status(404).json({ message: '提出データが見つかりませんでした' });
        }
        res.json(submissions);
    } catch (error) {
        console.error('提出データ取得エラー:', error.message);
        res.status(502).json({ 
            error: 'Bad Gateway', 
            details: 'データベースから提出データの取得に失敗しました。' 
        });
    }
});

module.exports = router;