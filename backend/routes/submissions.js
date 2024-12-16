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
    try {
        const submissions = await getAllSubmissions();
        if (!submissions) {
            return res.status(404).json({ message: 'No submissions found' });
        }
        res.json(submissions);
    } catch (error) {
        console.error('Get all submissions error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            details: error.message 
        });
    }
});

module.exports = router;