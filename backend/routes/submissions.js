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
    const submissions = await getAllSubmissions();
    res.json(submissions);
});

module.exports = router;