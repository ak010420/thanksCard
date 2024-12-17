document.addEventListener('DOMContentLoaded', async function () {
    try {
        // バックエンドから WOFF ID を取得
        const woffIdResponse = await fetch('/users/woff-id');
        if (!woffIdResponse.ok) {
            throw new Error('WOFF ID の取得に失敗しました。');
        }
        const { woffId } = await woffIdResponse.json();

        if (!woffId) {
            throw new Error('WOFF ID が空です。');
        }

        // WOFF SDK 初期化
        await woff.init({ woffId });
        console.log('WOFF SDK 初期化成功');

        // 実行環境確認
        const os = woff.getOS();
        console.log(`WOFF 実行環境: ${os}`);

        if (!woff.isInClient()) {
            console.warn('LINE WORKS アプリ外で実行されています。');
            alert('LINE WORKS アプリ内で完全に動作します。');
        }

        // ユーザーリスト取得
        const response = await fetch('/users');
        if (!response.ok) {
            throw new Error('ユーザーリストの取得に失敗しました。');
        }
        const users = await response.json();

        if (!Array.isArray(users)) {
            throw new Error('ユーザーリストが不正な形式です。');
        }

        console.log('Users fetched:', users);

        const receiver = document.getElementById('receiver');
        const userSpan = document.getElementById('user');

        // セレクトボックスの初期化
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '選択してください';
        receiver.appendChild(defaultOption);

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
        alert(`エラー: ${error.message}`);
    }
});
