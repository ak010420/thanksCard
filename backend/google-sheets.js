const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function getSheet(sheetName) {
    if (!process.env.TC_GOOGLE_CLIENT_EMAIL || !process.env.TC_GOOGLE_PRIVATE_KEY || !process.env.TC_SHEETID) {
        throw new Error('Missing Google Sheets configuration. Check your environment variables.');
    }

    const serviceAccountAuth = new JWT({
        email: process.env.TC_GOOGLE_CLIENT_EMAIL,
        key: process.env.TC_GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const doc = new GoogleSpreadsheet(process.env.TC_SHEETID);
    
    try {
        await doc.useServiceAccountAuth({
            client_email: process.env.TC_GOOGLE_CLIENT_EMAIL,
            private_key: process.env.TC_GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[sheetName];
        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found`);
        }
        return doc.sheetsByTitle[sheetName];
    } catch (error) {
        console.error('Error accessing Google Sheet:', error);
        throw error;
    }
}

async function updateSummarySheet() {
    const submissionsSheet = await getSheet('投稿一覧');
    const summarySheet = await getSheet('集計');
    
    const rows = await submissionsSheet.getRows();
    
    // データをグループ化して集計
    const groupedData = {};
    rows.forEach(row => {
        const { sender, receiver, date } = row;
        const [year, month] = date.split('-');
        const period = parseInt(month) <= 6 ? `${year}年上期` : `${year}年下期`;

        if (!groupedData[sender]) groupedData[sender] = {};
        if (!groupedData[receiver]) groupedData[receiver] = {};

        if (!groupedData[sender][period]) groupedData[sender][period] = { sent: 0, received: 0 };
        if (!groupedData[receiver][period]) groupedData[receiver][period] = { sent: 0, received: 0 };

        groupedData[sender][period].sent += 1;
        groupedData[receiver][period].received += 1;
    });

    // 動的に見出しを更新
    const headers = ['ユーザー名'];
    const allPeriods = new Set();
    Object.values(groupedData).forEach(data => {
        Object.keys(data).forEach(period => allPeriods.add(period));
    });
    Array.from(allPeriods).sort().forEach(period => {
        headers.push(`${period}_送信件数`, `${period}_受信件数`);
    });

    await summarySheet.clear();
    await summarySheet.setHeaderRow(headers);

    // データ行を追加
    const summaryRows = Object.keys(groupedData).map(user => {
        const row = { 'ユーザー名': user };
        allPeriods.forEach(period => {
            const userPeriod = groupedData[user][period] || { sent: 0, received: 0 };
            row[`${period}_送信件数`] = userPeriod.sent;
            row[`${period}_受信件数`] = userPeriod.received;
        });
        return row;
    });

    await summarySheet.addRows(summaryRows);
}

module.exports = { getSheet, updateSummarySheet };
