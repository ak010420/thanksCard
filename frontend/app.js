document.addEventListener('DOMContentLoaded', async () => {
    try {
        // WOFF初期化
        const woffId = window.TC_WOFF_ID;
        await woff.init({ woffId });
        console.log('WOFF SDK initialized');

        // WOFF環境確認
        if (!woff.isInClient()) {
            alert('LINE WORKSアプリ内でのみ実行可能です。');
            return;
        }

        const profile = await woff.getProfile();
        console.log('Current User Profile:', profile);

        const currentUserId = profile.userId;
        const displayName = profile.displayName;
        document.getElementById('user').textContent = `ようこそ、${displayName} さん`;

        // 初期表示: nav-tabsスライダー設定
        const navTabs = document.querySelectorAll('.nav-tabs .tab');
        const navSlider = document.querySelector('.nav-tabs .slider');

        const setNavSliderPosition = (activeTab) => {
            const tabWidth = activeTab.offsetWidth;
            let leftPosition = 0;
            navTabs.forEach((tab, index) => {
                if (tab === activeTab) return;
                leftPosition += tab.offsetWidth;
            });
            navSlider.style.width = `${tabWidth}px`;
            navSlider.style.transform = `translateX(${leftPosition}px)`;
        };

        const initialNavTab = document.querySelector('.nav-tabs .tab.active');
        if (initialNavTab) setNavSliderPosition(initialNavTab);

        navTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                navTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                setNavSliderPosition(this);

                const tabId = this.getAttribute('data-tab');
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                const targetContent = document.getElementById(tabId);
                if (targetContent) targetContent.classList.add('active');

                // 投稿一覧タブのロード処理
                if (tabId === 'all') loadAllSubmissions();
            });
        });

        // 全投稿表示処理
        async function loadAllSubmissions() {
            try {
                const response = await fetch('/submissions/all');
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
                console.error('投稿一覧読み込みエラー:', error);
            }
        }

        // 履歴読み込み関数
        async function loadHistory(type) {
            try {
                const response = await fetch(`/submissions/${currentUserId}?filter=${type}`);
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

        // 初回表示: 送信履歴をロード
        loadHistory('sent');

    } catch (error) {
        console.error('初期化エラー:', error);
        alert('アプリの初期化に失敗しました。');
    }
});
