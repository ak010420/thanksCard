document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM Content Loaded');
         // スライダーの位置を更新する関数
        function updateSlider(activeTab) {
            const slider = document.querySelector('.nav-tabs .slider');
            const tabs = document.querySelectorAll('.nav-tabs .tab');
            
            // デバッグ用のコンソールログを追加
            console.log('Slider:', slider);
            console.log('Tabs:', tabs);
            
            if (!slider || !tabs.length) {
                console.warn('スライダーまたはタブが見つかりません');
                return;
            }

            // タブのインデックスを取得
            const index = Array.from(tabs).indexOf(activeTab);
            
            // スライダーの位置と幅を計算
            const tabWidth = activeTab.offsetWidth;
            const paddingLeft = parseInt(window.getComputedStyle(activeTab).paddingLeft);
            const paddingRight = parseInt(window.getComputedStyle(activeTab).paddingRight);
            
            // スライダーの幅をタブのパディングを除いた大きさに設定
            slider.style.width = `${tabWidth - paddingLeft - paddingRight}px`;
            
            // スライダーの水平位置を計算
            let leftPosition = 0;
            for (let i = 0; i < index; i++) {
                leftPosition += tabs[i].offsetWidth;
            }
            
            // パディングの分を調整
            slider.style.transform = `translateX(${leftPosition + paddingLeft}px)`;
        }

        // 履歴タブのスライダー位置を更新する関数
        function updateHistorySlider(activeTab) {
            const slider = document.querySelector('.history-tabs .history-tab-slider');
            const tabs = document.querySelectorAll('.history-tabs .history-tab');
            
            // タブのインデックスを取得
            const index = Array.from(tabs).indexOf(activeTab);
            
            // スライダーの位置と幅を計算
            const tabWidth = activeTab.offsetWidth;
            
            // スライダーの幅を設定
            slider.style.width = `${tabWidth}px`;
            
            // スライダーの水平位置を計算
            let leftPosition = 0;
            for (let i = 0; i < index; i++) {
                leftPosition += tabs[i].offsetWidth;
            }
            
            // スライダーを移動
            slider.style.transform = `translateX(${leftPosition}px)`;
        }

        // 初期表示: 投稿フォームタブをアクティブにする
        document.addEventListener('DOMContentLoaded', () => {
            const initialTab = document.querySelector('.nav-tabs .tab[data-tab="form"]');
            if (initialTab) {
                console.log('Initial tab found:', initialTab);
                updateSlider(initialTab);
            } else {
                console.warn('Initial tab not found');
            }
        });

        // タブ切り替えのイベントリスナーを追加
        const mainTabs = document.querySelectorAll('.nav-tabs .tab');
        mainTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                // すべてのタブからactiveクラスを削除
                mainTabs.forEach(t => t.classList.remove('active'));
                // クリックされたタブにactiveクラスを追加
                this.classList.add('active');

                // スライダーの位置を更新
                updateSlider(this);

                // タブに対応するコンテンツを表示
                const tabId = this.getAttribute('data-tab');
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                const targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // 全投稿タブの場合は投稿を読み込む
                if (tabId === 'all') {
                    loadAllSubmissions(); // 必要なときだけ実行
                }
            });
        });

        // リサイズ時にスライダーの位置を再計算
        window.addEventListener('resize', () => {
            const activeTab = document.querySelector('.nav-tabs .tab.active');
            if (activeTab) {
                updateSlider(activeTab);
            }
        });

        // 履歴タブのイベントリスナーを追加（既存のコードを以下で置き換え）
        const historyTabs = document.querySelectorAll('.history-tab');
        historyTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                // すべての履歴タブからactiveクラスを削除
                historyTabs.forEach(t => t.classList.remove('active'));
                // クリックされたタブにactiveクラスを追加
                this.classList.add('active');

                // スライダーの位置を更新
                updateHistorySlider(this);
        
                // 履歴タイプを取得して読み込み
                const type = this.getAttribute('data-type');
                loadHistory(type);
            });

            // 初回のスライダー位置設定
            const initialTab = document.querySelector('.history-tab.active');
            if (initialTab) {
                updateHistorySlider(initialTab);
            }
        });

        // WOFF IDをバックエンドから取得
        const woffId = window.TC_WOFF_ID;

        // WOFF初期化
        const woff = await WOFF.init({ woffId });
        console.log('WOFF initialized:', woff);

        if (!woff.isInClient()) {
            alert('LINE WORKSアプリ内でのみ実行可能です。');
            return;
        }

        const user = await woff.getUser();
        console.log('Logged-in user:', user); // ユーザー情報を確認
        if (!user) {
            console.error('User is not logged in or there is an issue fetching user info.');
            return;
        }

        // ユーザー名を表示
        const usernameElement = document.querySelector('.username');
        usernameElement.textContent = `${user.name} さん`;

        // 宛名リストを取得してセレクトボックスに表示
        const userListResponse = await fetch('/users');
        if (!userListResponse.ok) {
            console.error('Failed to fetch user list.');
            alert('ユーザー情報の取得に失敗しました。再度お試しください。');
            return;
        }
        const users = await userListResponse.json();
        console.log('Fetched users from backend:', users);// ここでレスポンス内容を確認

        const select = document.getElementById('receiver');
        if (!select) {
            console.error('Receiver select element not found.');
            return;
        }
        if (users.length === 0) {
            console.warn('No users available.');
            select.innerHTML = '<option value="">利用可能なユーザーがいません</option>';
        } else {
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                select.appendChild(option);
            });
        }

        document.getElementById('submissionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const receiver = document.getElementById('receiver').value;
            const date = document.getElementById('date').value;
            const content = document.getElementById('content').value;

            if (!receiver || !date || !content) {
                alert('すべてのフィールドを入力してください。');
                return;
            }
        
            try {
                const response = await fetch('/submissions', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ 
                        sender: user.id, 
                        receiver, 
                        date, 
                        content 
                    })
                });
        
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`送信エラー: ${response.status} - ${errorText}`);
                }
        
                const result = await response.json();
                alert('送信しました！');
                // フォームのリセット
                document.getElementById('submissionForm').reset();

            } catch (error) {
                console.error('送信エラー:', error);
                alert('送信に失敗しました。再度お試しください。');
            }
        });

        async function loadHistory(type) {
            try {
                const user = await WOFF.init({ woffId }).getUser();
                const response = await fetch(`/submissions/${user.id}?filter=${type}`);
                const submissions = await response.json();
                
                const container = document.getElementById('history-content');
                container.innerHTML = '';

                submissions.forEach(submission => {
                    const card = document.createElement('div');
                    card.classList.add('submission-card');
                    card.innerHTML = `
                        <div class="submission-header">
                            ${type === 'sent' 
                                ? `宛名: ${submission.receiver} さんへ`
                                : `送信者: ${submission.sender} さんから`
                            }
                        </div>
                        <div class="submission-date">日付: ${submission.date}</div>
                        <div class="submission-content">${submission.content}</div>
                    `;
                    container.appendChild(card);
                });
            } catch (error) {
                console.error('履歴読み込みエラー:', error);
            }
        }

        async function loadAllSubmissions() {
            try {
                const response = await fetch('/submissions/all');
                
                // レスポンスの詳細を確認
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }

                const submissions = await response.json();
                
                const container = document.getElementById('all-content');
                container.innerHTML = '';

                submissions.forEach(submission => {
                    const card = document.createElement('div');
                    card.classList.add('submission-card');
                    card.innerHTML = `
                        <div class="submission-header">
                            宛名: ${submission.receiver} さんへ
                        </div>
                        <div class="submission-sender">
                            送信者: ${submission.sender} さんから
                        </div>
                        <div class="submission-date">日付: ${submission.date}</div>
                        <div class="submission-content">${submission.content}</div>
                    `;
                    container.appendChild(card);
                });
            } catch (error) {
                console.error('全投稿読み込みエラー:', error);
            }
        }
    } catch (error) {
        // エラー時のUI表示
        const container = document.getElementById('all-content');
        container.innerHTML = `<div class="error-message">投稿の読み込みに失敗しました: ${error.message}</div>`;
    }
});

// サーバーエンドポイントの検証
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // エンドポイント検証
        const endpoints = [
            '/submissions/all', 
            '/users', 
            '/api/woff-id'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint);
                console.log(`${endpoint} - Status: ${response.status}`);
                
                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        console.log(`${endpoint} - Response:`, data);
                    }
                }
            } catch (error) {
                console.error(`Endpoint check failed for ${endpoint}:`, error);
            }
        }
    } catch (error) {
        console.error('エンドポイント検証エラー:', error);
    }
});