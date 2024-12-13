function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // WOFF IDをバックエンドから取得
        const response = await fetch('/api/woff-id');
        const data = await response.json();
        const woffId = data.woffId;

        // WOFF初期化
        const woff = await WOFF.init({ woffId });
        console.log('WOFF initialized:', woff);

        if (!woff.isInClient()) {
            alert('LINE WORKSアプリ内でのみ実行可能です。');
            return;
        }

        const user = await woff.getUser();
        console.log('Logged-in user:', user);

        // 宛名リストを取得してセレクトボックスに表示
        const userListResponse = await fetch('/users');
        const users = await userListResponse.json();
        const select = document.getElementById('receiver');
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            select.appendChild(option);
        });

        document.getElementById('submissionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const receiver = document.getElementById('receiver').value;
            const date = document.getElementById('date').value;
            const content = document.getElementById('content').value;

            await fetch('/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: user.id, receiver, date, content }),
            });

            alert('送信しました！');
        });
    } catch (error) {
        console.error('Error initializing WOFF:', error);
    }
});
