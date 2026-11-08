# issue #37 リファクタリング設計 — ルート整理と element-symbol-puzzle 公開

出典: https://github.com/y-maeda1116/Playful-Learning-Hub/issues/37（2026-09-28 refactor 調査）
日付: 2026-11-05
ブランチ: `refactor/37-root-structure`（1 PR に集約 — オーナー承認済み）

## intent と why

ルート直下に 40+ ファイルがフラットに並び、19k 行の未リンク TS プロジェクト（element-symbol-puzzle）がテストランナー二重運用（jest / vitest）を抱えたまま放置されている。本設計は issue の4項目をすべて解消する:

1. ルートのフラット構造 → ゲーム単位ディレクトリへ整理
2. element-symbol-puzzle を**公開する**（index からリンク・オーナー決定済み）
3. 巨大テストファイル 3 件（計 3,450 行）の分割
4. audio-manager.js の AudioContext ライフサイクル整理

## goals / non-goals / anti-goals

**goals**
- GitHub Pages の公開 URL（ルートの HTML ページ）を一切壊さない
- `npm test`（root vitest）1 本で全テストが走る状態にする
- element-symbol-puzzle がブラウザで実際に遊べるページになる

**non-goals**
- HTML ページ自体の移動（`ages-*.html` 等はルート維持 = URL 保持）
- ゲームロジック・UI の改良（構造整理のみ。振る舞いは変えない）
- CI ワークフローの新設（本 issue の範囲外）
- esp のゲームデザイン変更（既存 UIComponents を使って最低限遊べる形）

**anti-goals**
- スクリプト読み込みパスの置換漏れによるリンク切れ・コンソールエラー
- テスト分割時のアサーション削減（カバレッジを劣化させない）

## A. ルート整理

HTML ページはルートに残し、JS / CSS / dev 用 HTML を移動する。スクリプトは全ページで `<script src>` の相対パス直指定のため、全 HTML の参照を一括更新する。

### 移動マップ

**`shared/`**（複数ページから使われる基盤モジュール + 同居テスト）:
audio-manager / progress-tracker / progress-integration / progress-display / character-data / badge-system / gamification-system / user-content / seasonal-event / kanji-data（各 `.js` + `.test.js`）

**`games/<ゲーム名>/`**（ゲームプレイモジュール + 同居テスト）:
astronomy-sim / biology-quiz / chemistry-sim / classification-game / clock-game / coding-game / counting-game / emotion-game / foreign-lang-game / fraction-pizza / hiragana-learning / instrument-sim / kanji-puzzle / katakana-game / math-battle / multiplication-battle / quiz / rhythm-game / shape-puzzle / shopping-game / speed-game / story-creator / tracing-game / word-formation-game / word-relay / writing-practice

ディレクトリ名はモジュール名と同一（例: `games/clock-game/clock-game.js`）。テストは現在の `foo.js` + `foo.test.js` 同居スタイルを維持する。

**`css/`**: style.css / hiragana-learning.css（全 HTML の `<link>` 更新）

**`dev/`**: debug-mobile.html / quick-test.html / test-runner.html / progress-display-test.html / test-5-6-functionality.html / hiragana-game-example.html。`ages-3-4.html`・`ages-5-6.html` から `debug-mobile.html` へのリンクは `dev/debug-mobile.html` に更新。`dev/` 内部の相互リンク（quick-test → test-runner 等）も相対パス修正。

**削除**: `focused-practice-integration.js`（0 バイトの空ファイル、`ages-3-4.html` から読み込まれているだけ）→ ファイル削除 + script タグ削除。

### 判定ルール（ビルダー向け）

「ゲームプレイを提供するモジュール → `games/<名前>/`」「インフラ・共通データ → `shared/`」の1行ルール。迷ったら参照されているページ数より役割で判定（例: hiragana-learning は多数ページから読まれるがゲームモジュールなので `games/hiragana-learning/`）。

### vitest 設定

移動により `vitest.config` の変更は原則不要（glob で拾う）。ただし **`element-symbol-puzzle/**` の exclude は削除**（B で統合するため）。

## B. element-symbol-puzzle 公開

### 実態と制約

- esp は HTML エントリを持たない純 TS ライブラリ（GameOrchestrator + UIComponents が DOM に render する構造）
- 現在の `config/tsconfig.json` 出力は CommonJS → ブラウザでは直接動かない
- Pages はブランチ直配信で CI ビルドが存在しない → **ブラウザ用ビルド成果物はリポジトリにコミットする必要がある**
- root `devDependencies` に vite ^8.2.2 が既にある（未使用）→ **新依存を追加せず vite build を使う**

### 作業内容

1. **`element-symbol-puzzle/main.ts` を新規作成**: GameOrchestrator を起動し、MatchingGameUI を起点に既存 UIComponents を `#app` コンテナへマウントする最小ブートストラップ。モード切替（マッチング / クイズ等、実装済みのもの）はシンプルなボタンで選択可能に。ゲームデザインの新規実装はしない
2. **`element-symbol-puzzle/index.html` を新規作成**: サイトの他ページと同じ日本語トーンの自己完結ページ。`<script src="dist/app.js">` を読み込み、必要な CSS はこのページ内に記述
3. **ビルド**: root の `package.json` に `"build:esp": "vite build ..."` を追加し、`main.ts` を IIFE 形式で `element-symbol-puzzle/dist/app.js` へバンドル。成果物はコミットする
4. **dist の整理**: 現在 git 管理されている tsc 生成物（`.d.ts` + CommonJS `.js` 計 28 ファイル）は誰にも消費されていないため削除し、dist は `app.js` に置き換え
5. **jest の廃止**: `element-symbol-puzzle/config/jest.config.js`・`element-symbol-puzzle/package.json`・`element-symbol-puzzle/package-lock.json` を削除。`config/tsconfig.json` はエディタ型チェック用として最小構成で維持（jest 型参照の除去）
6. **root vitest へ統合**: `fast-check` を root `devDependencies` に追加（properties テストが使用）。`vitest.config` から esp exclude を削除し、esp の全テスト（unit / integration / properties）が root vitest で通ることを確認
7. **リンク**: `ages-9-10.html` と `all-ages.html` にゲームカードを追加（元素記号は小学校高学年〜の学習内容のため両方）。トップ `index.html` は年齢別カードのみのまま**変更しない**（オーナー決定: AGES ページのみに導線）
8. **公開モード**: MatchingGameUI / QuizGameUI / ChemicalFormulaPuzzleUI / PeriodicTableJigsawUI の **4 ゲームモード**をボタンで切替（オーナー決定）。FeedbackUI / RewardNotificationUI はモード内の自動補助として使用。ProgressTrackingUI は今回は公開しない

## C. 巨大テストファイルの分割

分割は describe ブロック境界で行い、**テストロジック・アサーションは変更しない**:

- `RewardSystem.test.ts` (1,295行) → 機能単位（例: ポイント計算 / バッジ付与 / 進捗反映など）の複数ファイルへ
- `UIComponents.test.ts` (1,156行) → コンポーネント単位（MatchingGameUI / QuizGameUI / ChemicalFormulaPuzzleUI / PeriodicTableJigsawUI / ProgressTrackingUI 等）へ
- `GameEngine.test.ts` (999行) → 機能単位（セッション制御 / 回答判定 / 難易度連携など）へ

配置は `__tests__/unit/` 配下にサブディレクトリ（例: `__tests__/unit/reward/`）を作っても、フラットに `RewardSystem.points.test.ts` のようにも良い。ビルダーの裁量。**分割前後でテスト数が一致することを vitest 実行結果で確認する。**

## D. audio-manager.js のライフサイクル

現状: コンストラクタで AudioContext を即生成、`visibilitychange` 対応なし、`close()` は 1 箇所のみ。

- `document.addEventListener('visibilitychange')` で、非表示時に `audioContext.suspend()`、復帰時に `resume()` を呼ぶ（null ガード付き）
- `close()` 系の破棄処理は二重 close しないようガード
- リスナーの登録解除手段（destroy 相当）を用意
- 上記の unit テストを `audio-manager.test.js` に追加（visibilitychange イベント発火で suspend/resume が呼ばれること等）

実装は既存コードのスタイル（`class AudioManager`、JSDoc 付き）に合わせる。

## constraints

- 既存コードスタイル維持: ルート JS は vanilla JS + グローバルクラス（ESM 化しない）。esp は TS
- Conventional Commits、`git push -u origin` で新ブランチ、PR はコミット履歴全体から作成
- `rm -rf /` や `.env` 編集などユーザー権限ルールの遵守（本タスクでは該当なし）
- テスト実行: `npm test`（vitest）がグリーンであること。ビルド: `npm run build:esp` が成功すること

## ビルダーチェックで確定した追加作業

- esp テストの `jest.fn`（98 箇所）・`jest.Mock`（5 箇所）→ `vi.fn` 等への機械的置換が必要（アサーションは不変）
- JS 内の cross-file `require`（hiragana-learning.js → character-data / audio-manager / badge-system / gamification-system / writing-practice / word-formation-game、kanji-puzzle.js → kanji-data）は移動により相対パスが崩れるため、HTML 参照更新と併せて JS 内 require パスも更新する
- **kanji-puzzle.js の既存不具合（トップレベル require でブラウザ即死）は本 PR では直さない**（オーナー決定: 別 issue で対応）。移動に伴う require パス修正のみ実施。検証の基準は「既存コンソールエラーの増減ゼロ」

## 検証計画

1. `npm test` — 全テスト（ルート + esp 統合後）グリーン、テスト総数が分割前後で一致
2. `npm run build:esp` 成功、`element-symbol-puzzle/dist/app.js` 生成
3. 全 HTML の `src=""` / `href=""` が実在パスを指すことの grep 検証（移動漏れ検出）
4. ブラウザで index → ages-9-10 → esp ページ遷移とゲーム起動の確認（可能なら Playwright）。コンソールエラーの基準は「**既存エラーの増減ゼロ**」（kanji-puzzle の既存エラーは別 issue 対象）

## ビルダーへの委任（私の裁量で決めた点）

- `shared/` と `games/` の個別ファイルの最終分類（上記リストからの逸脱があれば PR 説明に記す）
- 分割後テストファイルの命名と配置
- esp `main.ts` の具体的なマウント実装とページ CSS
- vite build の具体的な config 記法（CLI フラグ or 設定ファイル）

## オーナー決定済み事項

- 4項目すべて 1 PR で対応
- esp は「公開する（index からリンク）」
- esp の独自 package.json / package-lock / jest 設定の削除を含む
- esp への導線は ages-9-10 / all-ages のみ（トップ index.html は変更しない）
- kanji-puzzle.js の既存ブラウザ不具合は別 issue で対応（本 PR では移動に伴うパス修正のみ）
- esp 公開ページは 4 ゲームモード（進捗表示 UI は非公開）
