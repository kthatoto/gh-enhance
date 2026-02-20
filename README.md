# GH Enhance

GitHub体験を強化するChrome拡張機能

## 機能一覧

### LGTM ワンクリックApprove
- PRの Changes/Files ページに「LGTM」ボタンを追加
- ワンクリックでApprove + コメント送信
- GitHubのログインセッションをそのまま利用（トークン不要）
- ボタンテキストは設定でカスタマイズ可能（デフォルト: `LGTM👍`）

## 必要条件

- Node.js 18以上
- npm

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/kthatoto/gh-enhance.git
cd gh-enhance
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. ビルド

```bash
npm run build
```

### 4. Chrome拡張機能として読み込み

1. Chrome で `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をONにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. プロジェクトの `dist` フォルダを選択
5. 拡張機能が追加されたことを確認

## 設定

拡張機能のオプションページからボタンテキストをカスタマイズできます。

## 開発

```bash
npm run dev   # 開発モード
npm run build # 本番ビルド
```
