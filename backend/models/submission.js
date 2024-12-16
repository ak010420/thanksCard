const googleSheets = require('../google-sheets');

async function addSubmission({ sender, receiver, date, content }) {
    const sheet = await googleSheets.getSheet('投稿一覧');
    const timestamp = new Date().toISOString();
    await sheet.addRow([sender, receiver, date, content, timestamp]);
}

async function getSubmissions(userId, filter) {
    const sheet = await googleSheets.getSheet('投稿一覧');
    const rows = await sheet.getRows();
    
    switch(filter) {
        case 'sent':
            return rows.filter(row => row.sender === userId);
        case 'received':
            return rows.filter(row => row.receiver === userId);
        default:
            return rows;
    }
}

async function getAllSubmissions() {
    const sheet = await googleSheets.getSheet('投稿一覧');
    return sheet.getRows();
}

module.exports = { addSubmission, getSubmissions, getAllSubmissions };