const express = require('express');
const axios = require('axios');
const { getAccessToken } = require('../lineworks');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const token = await getAccessToken();
        const response = await axios.get('https://apis.worksmobile.com/r/api/organization/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const users = response.data.users.map(user => ({
            id: user.id,
            name: user.name,
        }));

        res.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;