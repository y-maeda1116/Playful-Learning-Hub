# 点線をなぞるゲーム（3-4歳向け）デザイン

## メタデータ
- Issue: [#18「点線をなぞる」](https://github.com/y-maeda1116/Playful-Learning-Hub/issues/18)
- 作成日: 2026-06-29
- 対象年齢: 3-4歳
- 配置先: `ages-3-4.html`

## 1. 概要
3-4歳児向けの「点線をなぞる（運筆）」ゲーム。丸・三角・四角などの基本図形と、直線・波線・ジグザグなどの線を、画面上の点線ガイドに沿って指またはマウスでなぞる。ひらがな学習（既存5-6歳向け）の前段として、就学前に運筆の基礎を養うことを目的とする。

## 2. 背景と目的
- issue #18「点線をなぞる」を実装する。
- 既存の `writing-practice.js`（5-6歳向けひらがな書き順練習）は「書き順」を前提とした文字特化設計であり、3-4歳向けの書き順を持たない図形なぞりには不適。差別化と安全性のため新規ファイルとする。

## 3. 要件
- **対象**: 3-4歳
- **なぞる内容**: 基本図形と線（丸、直線、三角、四角、波線、ジグザグの6種）
- **配置**: `ages-3-4.html` のゲームナビゲーションに「なぞり」を追加
- **進捗連携**: なし（ゲーム単体。`classification`/`katakana`/`counting` と同じ方針）

## 4. 設計判断と根拠

### 4.1 新規独立ファイル（`writing-practice.js` 拡張でない）
- `writing-practice.js` の `WritingPracticeGame` は `startPractice(character)`、`nextStroke`、`showStrokeOrderNumber`、`updateStrokeCounter` など書き順を前提とする設計。書き順を持たない図形（丸・三角）とは設計不一致。
- 既存ファイルを改造すると、ひらがな機能および `writing-practice.test.js` に影響するリスクが大きく、AGENTS.md のスコープ規律に合致しない。
- **結論**: 新規 `tracing-game.js`（関数ベース）とし、既存ファイルは一切改修しない。

### 4.2 SVGベース（Canvasでない）
- レスポンシブ対応が容易（`viewBox` で自動拡縮）。
- jsdom 環境で DOM 要素としてアサーション可能。Canvas の `getContext` モックが不要になりテストが簡素化される。
- 点線ガイドとユーザー軌跡を同一 `viewBox` の統一座標系で扱える。

## 5. ファイル構成
| 操作 | ファイル | 内容 |
|---|---|---|
| 新規 | `tracing-game.js` | `initTracingGame()` 関数。CommonJS export。`DOMContentLoaded` で自動初期化 |
| 新規 | `tracing-game.test.js` | vitest + jsdom テスト |
| 編集 | `ages-3-4.html` | ナビボタン、セクション、`<script>`、`switchToGame('tracing')` 追加 |
| 編集 | `style.css` | `tracing-*` クラス追加（既存スタイル踏襲） |

## 6. アーキテクチャ

### 6.1 モジュール構造
```
initTracingGame()                              // エントリ。#tracing-game を探し、不在なら noop
  ├─ buildUI()                                 // ヘッダー/SVGキャンバス/フィードバック/ボタン生成
  ├─ SHAPES (const, frozen)                    // イミュータブルな図形データ配列
  ├─ loadShape(index)                          // 指定図形のガイドを描画、状態リセット
  ├─ bindPointerEvents()                       // pointerdown/move/up で軌跡収集
  ├─ calculateAccuracy(userPts, guidePts, tol) // 純粋関数。0-100 を返す
  ├─ evaluateTrace()                           // pointerup 時に精度判定＋フィードバック
  └─ nextShape() / resetShape()
```

### 6.2 図形データ（イミュータブル）
```js
const SHAPES = Object.freeze([
  { id: 'circle',   name: 'まる',       path: '...', difficulty: 1 },
  { id: 'line',     name: 'まっすぐ',   path: '...', difficulty: 1 },
  { id: 'triangle', name: 'さんかく',   path: '...', difficulty: 2 },
  { id: 'square',   name: 'しかく',     path: '...', difficulty: 2 },
  { id: 'wave',     name: 'なみ',       path: '...', difficulty: 3 },
  { id: 'zigzag',   name: 'ぎざぎざ',   path: '...', difficulty: 3 },
]);
```
- `path` には各図形のSVGパス文字列を格納する（具体座標は実装時に `viewBox 0 0 300 300` に収まるよう設定）。
- 進行は配列順（難易度順：易→難）。最後まで進むと最初に戻る。

### 6.3 描画と判定

**描画（SVG 2層、viewBox `0 0 300 300`）:**
- ガイド層: `<path d="..." stroke-dasharray="8,8">`（点線、薄い色）
- ユーザー層: `<polyline>`（`pointermove` で点を追加、太い実線、子どもが見やすい色）

**判定（`calculateAccuracy`、純粋関数・副作用なし）:**
1. ガイドパスを等間隔（約5px間隔・約60点）でサンプリング → `guidePoints[]`
2. ユーザー各点からガイド点群への最近傍距離を計算
3. 指標A（はみ出し）: ユーザー点のうち `tolerance`（既定25px）以内の割合
4. 指標B（途切れ）: ガイド点のうち `tolerance` 以内にユーザー点が存在する割合
5. `accuracy = round((A + B) / 2)`（0-100）

**成功基準**: `accuracy >= 70` → 成功フィードバック（緑）。未満 → 再挑戦フィードバック（オレンジ）。

### 6.4 UI/UX
- 正方形キャンバス（最大約320px、タッチ対応）
- 図形名をひらがな表示（「まる」など）
- フィードバック: 太字・緑/オレンジ。`AudioManager` が存在すれば効果音を鳴らす（オプション・存在時のみ）
- ボタン: 「つぎ」「やりなおし」
- アクセシビリティ: `role`、`aria-label`、キーボードで「つぎ」操作可

### 6.5 状態管理（イミュータブル）
- 状態: 現在の図形 index、現在のユーザー軌跡点配列、成功回数/試行回数
- 更新は新しいオブジェクト/配列の生成で行い、ミューテーションを避ける（ユーザーコーディング規約 `coding-style.md` 準拠）。軌跡点は「新しい配列に前配列と1点を追加」で表現する。

## 7. ages-3-4.html 統合

### 7.1 ナビゲーションボタン追加（`.game-selector` 内、counting ボタンの後）
```html
<button id="tracing-game-btn" class="game-nav-button"
        role="tab" aria-selected="false" aria-controls="tracing-game-section"
        aria-label="なぞりあそび - せんをなぞろう">
    <span class="game-icon" aria-hidden="true">✏️</span>
    <span class="game-title">なぞり</span>
    <span class="game-description">せんをなぞろう</span>
</button>
```

### 7.2 セクション追加
```html
<div id="tracing-game-section" class="game-section"
     role="tabpanel" aria-labelledby="tracing-game-btn" aria-hidden="true">
    <div id="tracing-game"></div>
</div>
```

### 7.3 script追加（`counting-game.js` の後）
```html
<script src="tracing-game.js"></script>
```

### 7.4 `switchToGame` に `tracing` ケース追加 + ボタンイベントリスナー追加
他のゲームケース（`classification`/`katakana`/`counting`）と同じパターン（該当セクションとボタンの `active`/`aria-*` を切替）。

## 8. テスト戦略（vitest + jsdom、カバレッジ80%以上）
- **UI生成**: `buildUI` でヘッダー、SVG、ガイドpath、polyline、ボタンが生成される
- **図形データ**: `SHAPES` 全要素に `id`/`name`/`path`/`difficulty` がある、`Object.freeze` されている、6種ある
- **`calculateAccuracy`（純粋関数）**:
  - ユーザー点が完全にガイド上 → 100
  - ユーザー点が完全に外れる → 低い値
  - `tolerance` 境界の挙動、空入力の安全処理
- **ポインタイベント**: `pointerdown`/`move`/`up` を dispatch しても例外なく、軌跡が収集される
- **次図形**: `nextShape` でガイドpathと図形名が切り替わる
- **リセット**: `resetShape` で polyline がクリアされる
- **コンテナ不在**: `initTracingGame` が安全に noop する

## 9. スコープ外（YAGNI）
- 進捗システム連携（`progressTracker`/`badge`）: 後続イテレーションで追加可能
- 5-6歳向けの文字なぞり: 既存 `writing-practice.js` が別途対応
- 音声認識、なぞり画像の保存機能、難易度設定UI など

## 10. 成功基準
- `ages-3-4.html` で「なぞり」ボタンからゲームが起動する
- 6種の図形・線が点線ガイドで表示され、なぞると軌跡が描かれる
- 精度判定が動作し、70%以上で成功フィードバックが出る
- `npm test` が全件合格、`tracing-game.js` のカバレッジ80%以上
- 既存ゲーム・テストに回帰がない
