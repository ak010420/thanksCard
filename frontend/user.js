document.addEventListener('DOMContentLoaded', async function() {
    try {
        // ユーザーリストをバックエンドから取得
        const response = await fetch('/users');

        if (!response.ok) {
            throw new Error(`ユーザーリストの取得に失敗しました: ${response.status}`);
        }

        const data = await response.json();
        console.log('Users fetched:', data);

        // ユーザーリストの検証
        if (!data || !Array.isArray(data)) {
            throw new Error('取得したユーザーデータが配列形式ではありません。');
        }

        // ユーザーリストをセレクトボックスに表示
        const users = data; // 取得データを users として使用
        const receiver = document.getElementById('receiver');
        const userSpan = document.getElementById('user');

        if (!receiver || !userSpan) {
            console.error('必要なHTML要素が見つかりません。');
            return;
        }

        users.forEach(user => {
            if (user && user.id && user.name) {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                receiver.appendChild(option);
            } else {
                console.warn('無効なユーザーデータ:', user);
            }
        });

        // ユーザー選択イベントの処理
        receiver.addEventListener('change', function() {
            const selectedUserId = receiver.value;
            const selectedUser = users.find(u => u.id === selectedUserId);
            userSpan.textContent = selectedUser ? selectedUser.name : '選択されていません';
        });

    } catch (error) {
        console.error('ユーザーリストの取得に失敗しました:', error.message);
    }
});
