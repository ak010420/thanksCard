document.addEventListener('DOMContentLoaded', async function () {
    try {
        // WOFF ID の取得
        const woffIdResponse = await fetch('/users/woff-id');
        const { woffId } = await woffIdResponse.json();

        if (!woffId) {
            throw new Error('WOFF ID が取得できませんでした。');
        }

        // WOFF SDK 初期化 - エラーハンドリングを追加
        await woff.init({ woffId })
            .then(() => {
                console.log('WOFF SDK 初期化成功');
                
                // 実行環境を確認
                const os = woff.getOS();
                console.log(`WOFF 実行環境: ${os}`);

                if (!woff.isInClient()) {
                    console.warn('LINE WORKS アプリ外で実行されています。一部の機能が制限される可能性があります。');
                    
                    // Web環境の場合の追加処理
                    if (!woff.isLoggedIn()) {
                        // ログインプロセスの開始
                        woff.login({
                            redirectUri: window.location.href // 現在のページにリダイレクト
                        });
                    }
                }

                // ユーザーリスト取得
                return fetch('/users');
            })
            .then(response => {
                if (!response.ok) throw new Error('ユーザーリストの取得に失敗しました。');
                return response.json();
            })
            .then(users => {
                console.log(`取得したユーザー数: ${users.length}`);

                // ユーザーセレクトボックス更新
                const receiver = document.getElementById('receiver');
                const userSpan = document.getElementById('user');

                if (receiver) {
                    receiver.innerHTML = '<option value="">選択してください</option>';
                    users.forEach(user => {
                        const option = document.createElement('option');
                        option.value = user.id;
                        option.textContent = user.name || '名前未設定';
                        receiver.appendChild(option);
                    });

                    receiver.addEventListener('change', () => {
                        const selectedUser = users.find(user => user.id === receiver.value);
                        if (userSpan) {
                            userSpan.textContent = selectedUser ? selectedUser.name : '選択されていません';
                        }
                    });
                }
            })
            .catch((err) => {
                console.error('WOFF SDK 初期化エラー詳細:', {
                    name: err.name,
                    message: err.message,
                    code: err.code
                });
                
                // エラーメッセージ表示
                const initErrorMessage = document.getElementById('woffInitErrorMessage');
                if (initErrorMessage) initErrorMessage.hidden = false;
            });
    } catch (error) {
        console.error('エラーが発生しました:', error.message);
        alert(`エラー: ${error.message}`);
    }
});