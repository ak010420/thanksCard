const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function getSheet(sheetName) {
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        
        // service-account.jsonの追加情報を任意で追加可能
        projectId: process.env.GOOGLE_PROJECT_ID,
        audience: process.env.GOOGLE_TOKEN_URI
    });

    const doc = new GoogleSpreadsheet(process.env.SHEETID);
    await doc.auth(serviceAccountAuth);
    await doc.loadInfo();
    return doc.sheetsByTitle[sheetName];
}

async function updateSummarySheet() {
    const submissionsSheet = await getSheet('Submissions');
    const summarySheet = await getSheet('Summary');
    
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
