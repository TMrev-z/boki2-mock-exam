# 簿記2級 ネット試験 模擬試験システム

簿記2級のネット試験形式を再現した模擬試験アプリケーションです。

## 🌐 デプロイURL

**本番環境**: https://boki2-mock-exam-pwt4x73uzq-an.a.run.app

## 🎯 主な機能

### 試験機能
- **90分タイマー**: 本試験と同じ90分の制限時間
- **10パターンの模擬試験**: 様々な難易度と出題傾向
- **5問構成**: 商業簿記3問 + 工業簿記2問
- **自動採点**: 回答完了後、即座に採点結果を表示
- **詳細な解説**: 各問題に分かりやすい解説を用意

### 出題内容
#### 商業簿記
- 株式会社会計
- 固定資産・減価償却
- リース取引
- 引当金
- 税金・税効果会計
- 外貨建取引
- 連結会計
- 本支店会計
- 決算整理・財務諸表作成

#### 工業簿記
- 個別原価計算
- 部門別原価計算
- 総合原価計算
- 標準原価計算
- 直接原価計算・CVP分析

### その他の機能
- **受験履歴**: LocalStorageに保存され、過去の受験記録を確認可能
- **統計情報**: 受験回数、合格回数、平均点、最高点を表示
- **レスポンシブデザイン**: PC・タブレット・スマートフォンに対応

## 🚀 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **デプロイ**: Google Cloud Run
- **CI/CD**: Cloud Build
- **コンテナ**: Docker (multi-stage build)
- **ストレージ**: LocalStorage (クライアント側)

## 📁 プロジェクト構成

```
boki2-mock-exam/
├── app/
│   ├── page.tsx              # トップページ
│   ├── layout.tsx            # ルートレイアウト
│   ├── globals.css           # グローバルスタイル
│   ├── exams/
│   │   └── page.tsx          # 試験選択ページ
│   ├── exam/
│   │   └── [id]/
│   │       └── page.tsx      # 試験実施ページ
│   └── history/
│       └── page.tsx          # 受験履歴ページ
├── lib/
│   ├── types/
│   │   └── exam.ts           # 型定義
│   └── data/
│       ├── exams.ts          # 試験データ管理
│       ├── exam1.ts          # 第1回試験データ
│       ├── exam2.ts          # 第2回試験データ
│       └── ...               # exam3～exam10
├── public/                   # 静的ファイル
├── Dockerfile                # Docker設定
├── cloudbuild.yaml          # Cloud Build設定
└── package.json             # 依存関係

```

## 🛠️ ローカル開発

### 前提条件
- Node.js 20.x
- npm

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/TMrev-z/boki2-mock-exam.git
cd boki2-mock-exam

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

### ビルド

```bash
npm run build
npm start
```

## 🚢 デプロイ

### GCP Cloud Runへのデプロイ

```bash
# GCPプロジェクトを設定
gcloud config set project boki2-mock-exam-1761488499

# Cloud Buildでビルド＆デプロイ
gcloud builds submit --config cloudbuild.yaml
```

## 📝 試験データの追加

新しい試験パターンを追加する場合:

1. `lib/data/examN.ts` を作成 (Nは試験番号)
2. `exam1.ts` の形式に従ってデータを定義
3. `lib/data/exams.ts` にインポートを追加
4. `app/exams/page.tsx` の `examPatterns` 配列に追加

## 🎨 カスタマイズ

### 試験時間の変更
各試験データの `timeLimit` プロパティを変更してください（単位：分）。

### 合格点の変更
`app/exam/[id]/page.tsx` の判定ロジック（`result.score >= 70`）を変更してください。

## 📄 ライセンス

© 2025 簿記2級 ネット試験 模擬試験システム

## 🤖 開発情報

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
