システム概要
主要機能
LINE WORKS固定メニュー
「ありがとうの木投稿」を固定メニューに追加。
選択するとWOFFで提供するウェブページに遷移します。
WOFFページ
タブ切り替え機能:
宛名、日付、内容を入力して送信するフォーム。
自分の送信履歴。
自分宛の受信履歴。
他のユーザーの一覧投稿。
Googleスプレッドシート連携
投稿内容記録。
期間ごとに送信・受信を集計。
テクノロジースタック
フロントエンド: HTML、CSS、JavaScript (バニラ)
バックエンド: Node.js (Express)
データベース : Google スプレッドシート API
デプロイ: Docker + AWS Lambda (または Heroku/GCP)

Dockerイメージをビルド:
docker build -t thanks-card-system .

デプロイ (例: AWS Elastic Beanstalk):
eb create thanks-card-app

1. LINE WORKS BOT連携
固定メニューの設定: LINE WORKSの開発者コンソールに、以下のようなBOTメニューを追加:
{
    "content": {
        "type": "text",
        "text": "ありがとうの木投稿"
    },
    "actions": [
        {
            "type": "uri",
            "label": "投稿ページを開く",
            "uri": "https://example.com/woff"
        }
    ]
}

2. デプロイ手順 (Render.com)
レンダーアカウント作成: レンダーでアカウントを作成します。
新しいWebサービスの作成:
リポジトリをGitHubにアップロード。
レンダリングで「+新規→Webサービス」を選択。
リポジトリを選択します。
設定:
ビルドコマンド:npm install
開始コマンド:node app.js
環境変数に.env値を追加。
デプロイ開始:
無料プランでデプロイが完了すると、公開URLが提供されます。
