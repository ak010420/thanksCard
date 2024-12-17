document.addEventListener('DOMContentLoaded', async function() {
    try {
        // WOFF ID をバックエンドから取得
        const woffIdResponse = await fetch('/users/woff-id');
        const { woffId } = await woffIdResponse.json();

        // WOFF SDK 初期化
        await woff.init({ woffId });
        console.log('WOFF SDK initialized successfully');

        // ユーザーリスト取得
        const response = await fetch('/users');
        const users = await response.json();

        console.log('Users fetched:', users);

        const receiver = document.getElementById('receiver');
        const userSpan = document.getElementById('user');

        // 初期化: セレクトボックスにデフォルトオプションを追加
        receiver.innerHTML = '<option value="">選択してください</option>';

        // ユーザーリストをセレクトボックスに追加
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id; // ユーザーID
            option.textContent = user.name || '名前未設定'; // ユーザー名
            receiver.appendChild(option);
        });

        // 選択時にユーザー名を表示
        receiver.addEventListener('change', () => {
            const selectedUserId = receiver.value;
            const selectedUser = users.find(user => user.id === selectedUserId);
            userSpan.textContent = selectedUser ? selectedUser.name : '選択されていません';
        });
    } catch (error) {
        console.error('エラーが発生しました:', error.message);
    }
});
