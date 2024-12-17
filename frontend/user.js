document.addEventListener('DOMContentLoaded', async function() {
    try {
        // ユーザーリストをバックエンドから取得
        const response = await fetch('/users');
        const users = await response.json();

        // コンソールで確認
        console.log('Users fetched:', users);

        const receiver = document.getElementById('receiver');
        const userSpan = document.getElementById('user');

        // ユーザーリストをセレクトオプションに追加
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            receiver.appendChild(option);
        });

        // セレクトボックスの選択が変更された場合
        receiver.addEventListener('change', async function() {
            const userId = receiver.value;
            if (userId) {
                // 選択されたユーザーの名前を表示
                const user = users.find(u => u.id === userId);
                userSpan.textContent = user ? user.name : '選択されていません';
            } else {
                userSpan.textContent = '選択されていません';
            }
        });
    } catch (error) {
        console.error('ユーザーリストの取得に失敗しました:', error);
    }
});
