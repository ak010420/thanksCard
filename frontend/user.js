document.addEventListener('DOMContentLoaded', async function() {
    try {
        // バックエンドからユーザーリストを取得
        const response = await fetch('/users');
        const data = await response.json();

        // ユーザーリストのデータ確認
        console.log('Users fetched:', data);

        const users = data.users; // ユーザーリストの配列
        const receiver = document.getElementById('receiver');
        const userSpan = document.getElementById('user');

        // セレクトボックスの初期化
        receiver.innerHTML = '<option value="">選択してください</option>';

        // ユーザーリストをセレクトオプションに追加
        users.forEach(user => {
            if (user.userName) {
                const { lastName, firstName } = user.userName;
                const fullName = `${lastName || ''} ${firstName || ''}`.trim();

                const option = document.createElement('option');
                option.value = user.userId; // ユーザーIDを value に設定
                option.textContent = fullName || '名前不明'; // 姓名が空ならデフォルト表示

                receiver.appendChild(option);
            }
        });

        // セレクトボックス変更時の処理
        receiver.addEventListener('change', function() {
            const userId = receiver.value;
            const selectedUser = users.find(u => u.userId === userId);

            if (selectedUser && selectedUser.userName) {
                const { lastName, firstName } = selectedUser.userName;
                userSpan.textContent = `${lastName || ''} ${firstName || ''}`.trim();
            } else {
                userSpan.textContent = '選択されていません';
            }
        });
    } catch (error) {
        console.error('ユーザーリストの取得に失敗しました:', error);
    }
});
