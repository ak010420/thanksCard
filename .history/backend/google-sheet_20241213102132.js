const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./service-account.json');

const doc = new GoogleSpreadsheet('<Spreadsheet ID>');

async function getSheet(sheetName) {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    return doc.sheetsByTitle[sheetName];
}

module.exports = { getSheet };