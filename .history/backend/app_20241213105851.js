const express = require('express');
const bodyParser = require('body-parser');
const lineworks = require('./lineworks');
const googleSheets = require('./google-sheets');
const submissionRoutes = require('./routes/submissions');
const userRoutes = require('./routes/users'); // 新規追加

const app = express();

app.use(bodyParser.json());
app.use('/submissions', submissionRoutes);
app.use('/users', userRoutes); // ユーザー一覧のルート追加

// LINE WORKS BOTエンドポイント
app.post('/webhook', lineworks.handleBotEvent);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
