const express = require('express');
const { addSubmission, getSubmissions } = require('../models/submission');

const router = express.Router();

router.post('/', async (req, res) => {
    const { sender, receiver, date, content } = req.body;
    await addSubmission({ sender, receiver, date, content });
    res.status(201).json({ message: 'Submission added' });
});

router.get('/:userId', async (req, res) => {
    const submissions = await getSubmissions(req.params.userId);
    res.json(submissions);
});

module.exports = router;