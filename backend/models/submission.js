const googleSheets = require('../google-sheets');

async function addSubmission({ sender, receiver, date, content }) {
    const sheet = await googleSheets.getSheet('Submissions');
    const timestamp = new Date().toISOString();
    await sheet.addRow([sender, receiver, date, content, timestamp]);
}

async function getSubmissions(userId) {
    const sheet = await googleSheets.getSheet('Submissions');
    return sheet.getRows().filter(row => row.receiver === userId || row.sender === userId);
}

module.exports = { addSubmission, getSubmissions };