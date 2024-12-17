document.addEventListener('DOMContentLoaded', async function () {
    try {
        // WOFF ID の取得
        const woffIdResponse = await fetch('/users/woff-id');
        const { woffId } = await woffIdResponse.json();
        if (!woffId) throw new Error('WOFF ID が取得できませんでした。');

        // WOFF SDK 初期化 - エラーハンドリングを追加
        await woff.init({ 
            woffId: woffId 
        }).catch((err) => {
            console.error('WOFF SDK 初期化エラー:', err);
            // エラーの詳細なログを取得
            if (err instanceof WoffError) {
                console.log('エラーコード:', err.code);
                console.log('エラーメッセージ:', err.message);
            }
            throw err;
        });

        console.log('WOFF SDK 初期化成功');

        // 実行環境を確認
        const os = woff.getOS();
        console.log(`WOFF 実行環境: ${os}`);

        if (!woff.isInClient()) {
            console.warn('LINE WORKS アプリ外で実行されています。');
            alert('LINE WORKS アプリ内で動作する機能です。');
        }

        // ユーザーリスト取得
        const response = await fetch('/users');
        if (!response.ok) throw new Error('ユーザーリストの取得に失敗しました。');

        const users = await response.json();
        console.log('Users fetched:', users);

        // ユーザーセレクトボックス更新
        const receiver = document.getElementById('receiver');
        const userSpan = document.getElementById('user');

        receiver.innerHTML = '<option value="">選択してください</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name || '名前未設定';
            receiver.appendChild(option);
        });

        receiver.addEventListener('change', () => {
            const selectedUser = users.find(user => user.id === receiver.value);
            userSpan.textContent = selectedUser ? selectedUser.name : '選択されていません';
        });
    } catch (error) {
        console.error('エラーが発生しました:', error.message);
        alert(`エラー: ${error.message}`);
    }
});
