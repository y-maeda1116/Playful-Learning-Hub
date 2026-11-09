# issue #37 リファクタリング Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** issue #37 の4項目（ルート整理 / element-symbol-puzzle 公開 / 巨大テスト分割 / audio-manager ライフサイクル）を1つの PR で解消する。

**Architecture:** HTML ページはルートに残して Pages URL を保持し、JS/CSS を `games/`・`shared/`・`css/`・`dev/` へ移動。element-symbol-puzzle は vite バンドル + 新規 index.html で公開し、テストは root vitest に統合（jest 廃止）。テスト分割は describe 境界での機械的なファイル分割。

**Tech Stack:** vanilla JS（グローバルクラス、変更なし）/ TypeScript（esp）/ vitest 5（jsdom）/ vite 8（バンドルのみ、新依存なし）

**Spec:** `docs/superpowers/specs/2026-11-05-issue37-refactor-design.md`

## Global Constraints

- HTML ページ（`index.html`・`ages-*.html`・`all-ages.html`）はルートから**移動しない**
- トップ `index.html` は**変更しない**（esp 導線は ages-9-10 / all-ages のみ）
- テストのアサーションは分割・移動で**追加も削除もしない**（`jest.→vi.` の機械的置換を除く）
- kanji-puzzle.js の既存ブラウザ不具合（未ガード require）は本 PR では直さない。基準は「既存コンソールエラーの増減ゼロ」
- 新しい npm 依存は `fast-check` の root 追加のみ。vite は既存 ^8.2.2 を使用
- Conventional Commits。`.serena/project.yml` のローカル変更は staging しない
- コミット前に hook で console.log 追加チェックが走る。新規コードに console.log を入れない

## Review Focus

1. **参照パス置換漏れ**（HTML `src`/`href`、JS 内 `require('./…')`）— 期待動作: 全参照が実在ファイルに解決する → Task 1 の grep 検証ステップで全 HTML/JS を機械チェック
2. **esp バンドルがブラウザで読めない**（ESM 出力やルート相対パス）— 期待動作: `element-symbol-puzzle/index.html` が `dist/app.js` を相対参照で起動 → Task 5 のビルド検証
3. **テスト分割でのテスト数不足** — 期待動作: 分割前後で vitest のテスト総数が一致 → Task 4 で分割前の数を記録し比較
4. **audio-manager のリスナー漏れ** — 期待動作: `destroy()` 後の visibilitychange 発火でエラーが出ない → Task 2 のテストで pin
5. **jest 残骸による vitest 混線** — 期待動作: root vitest 1 本で esp 含む全テストが通り、jest 設定ファイルが存在しない → Task 3 で exclude 削除 + 全実行

---

### Task 1: ルート整理（移動 + 全参照更新）

**Files:**
- Move: ルートの JS 37 + テスト 35 + CSS 2 + dev 用 HTML 6 → 下記マップどおり
- Modify: 全 HTML（script/link 参照）、JS 内 `require` パス、`docs/`・README 内にあればパス参照
- Delete: `focused-practice-integration.js`（0 バイト）と `ages-3-4.html` 内のその script タグ

**Interfaces:**
- Produces: Task 2 が触るのは `shared/audio-manager.js` と `shared/audio-manager.test.js`。Task 3-5 が触るのは `element-symbol-puzzle/**`（移動対象外）

- [ ] **Step 1: ブランチ作成**

```bash
git checkout -b refactor/37-root-structure
git add docs/superpowers/
git commit -m "docs: issue #37 の設計書と実装計画を追加"
```

- [ ] **Step 2: 移動実行**

`mkdir -p shared css dev` し、`git mv` で以下へ移動（テストはモジュールに同居）:

- `shared/`: audio-manager / progress-tracker / progress-integration / progress-display / character-data / badge-system / gamification-system / user-content / seasonal-event / kanji-data（`.js` のみ。kanji-data にテストは無い）+ 対応する `.test.js`（audio-manager / progress-tracker / progress-integration / progress-display / character-data / badge-system / gamification-system / user-content / seasonal-event の9本）
- `games/<モジュール名>/`: astronomy-sim / biology-quiz / chemistry-sim / classification-game / clock-game / coding-game / counting-game / emotion-game / foreign-lang-game / fraction-pizza / hiragana-learning / instrument-sim / kanji-puzzle / katakana-game / math-battle / multiplication-battle / quiz / rhythm-game / shape-puzzle / shopping-game / speed-game / story-creator / tracing-game / word-formation-game / word-relay / writing-practice（各 `.js` + `.test.js`）
- `css/`: style.css / hiragana-learning.css
- `dev/`: debug-mobile.html / quick-test.html / test-runner.html / progress-display-test.html / test-5-6-functionality.html / hiragana-game-example.html / simple-test.js

- [ ] **Step 3: 削除**

```bash
git rm focused-practice-integration.js
```
`ages-3-4.html` から `<script src="focused-practice-integration.js"></script>` を削除。

- [ ] **Step 4: 全参照更新**

1. 全 HTML（ルート + `dev/`）の `src="*.js"`・`href="*.css"`・`href="*.html"` を移動先に機械的に更新（例: `src="audio-manager.js"` → `src="shared/audio-manager.js"`、`ages-*.html` 内の `href="debug-mobile.html"` → `href="dev/debug-mobile.html"`、`dev/` 内の `quick-test.html` → `test-runner.html` 参照は同一ディレクトリなので無編集）
2. JS 内 require の更新:
   - `games/kanji-puzzle/kanji-puzzle.js:9` → `require('../../shared/kanji-data.js')`
   - `games/hiragana-learning/hiragana-learning.js` 内 6 箇所 → `character-data` / `audio-manager` / `badge-system` / `gamification-system` は `../../shared/…`、`writing-practice` / `word-formation-game` は `../<ゲーム名>/<モジュール名>.js`
   - テストファイル内の `require('./…')`: 同一ディレクトリへ一緒に移動したものは無編集。**他モジュールを読んでいるテスト**（例: `progress-integration.test.js` がゲームモジュールを require）は移動先に合わせて `../shared/…` / `../<ゲーム名>/…` に更新
3. README.md・docs/ 内に旧パス参照があれば更新

- [ ] **Step 5: 検証**

Run: `npm test`
Expected: 全テスト PASS（移動だけでテストの内容は変わらない）

```bash
# 参照解決チェック: 全 HTML の src/href が実在パスを指すこと
grep -rhoE '(src|href)="[^"]+\.(js|css|html)"' --include="*.html" . | grep -v http | sort -u
```
Expected: 列挙された各パスが filesystem に存在する（1件1件確認）。JS 内 require も同様に `grep -n "require('\./" ` で列挙して解決確認。

- [ ] **Step 6: Commit**

```bash
git add -A ':!.serena'
git commit -m "refactor: ルートのフラット構造を games/shared/css/dev に整理 (#37)"
```

---

### Task 2: audio-manager のライフサイクル整理

**Files:**
- Modify: `shared/audio-manager.js`
- Test: `shared/audio-manager.test.js`

**Interfaces:**
- Produces: `AudioManager` に `handleVisibilityChange(): void`、`suspendAudio(): void`、`resumeAudio(): void` を追加。`destroy()` は visibilitychange リスナーを解除するよう拡張

- [ ] **Step 1: 失敗するテストを書く**

`shared/audio-manager.test.js` に `describe('AudioContext ライフサイクル')` を追加。jsdom に AudioContext は無いため、フェイクを `audioManager.audioContext = fakeContext` で注入する:

```javascript
function setHidden(hidden) {
    Object.defineProperty(document, 'hidden', { value: hidden, configurable: true });
}
function fireVisibilityChange() {
    document.dispatchEvent(new Event('visibilitychange'));
}
// fakeContext 例: { state: 'running', suspend: vi.fn(), resume: vi.fn(), close: vi.fn() }
```

書くテストは以下4本（fakeContext を `audioManager.audioContext` に代入してから発火）:

1. `非表示時に suspend() が呼ばれる` — fakeContext.state='running'、`setHidden(true); fireVisibilityChange()` → `expect(fakeContext.suspend).toHaveBeenCalled()`
2. `復帰時に resume() が呼ばれる` — fakeContext.state='suspended'、`setHidden(false); fireVisibilityChange()` → `expect(fakeContext.resume).toHaveBeenCalled()`
3. `audioContext が null のとき visibilitychange でもエラーにならない` — audioContext=null のまま `fireVisibilityChange()` → 例外が出なければ PASS
4. `destroy 後の visibilitychange でエラーにならない` — destroy() を呼んだ後 `setHidden(true); fireVisibilityChange()` → suspend/resume が呼ばれず、例外なし

- [ ] **Step 2: 失敗確認**

Run: `npm test -- shared/audio-manager.test.js`（vitest 5 は `vitest run shared/audio-manager` でも可）
Expected: FAIL（handleVisibilityChange が未定義）

- [ ] **Step 3: 実装**

`shared/audio-manager.js` の `AudioManager` に追加（既存の JSDoc + 4スペースインデントのスタイルに合わせる）:

- constructor の末尾で `this._visibilityHandler = () => this.handleVisibilityChange();` を定義し `document.addEventListener('visibilitychange', this._visibilityHandler)`（`typeof document !== 'undefined'` ガード付き）
- `handleVisibilityChange()`: `document.hidden ? this.suspendAudio() : this.resumeAudio()`
- `suspendAudio()`: `this.audioContext && this.audioContext.state === 'running' && this.audioContext.suspend()` を null ガード付きで
- `resumeAudio()`: 同様に `state === 'suspended'` で `resume()`
- `destroy()`: 冒頭で `document.removeEventListener('visibilitychange', this._visibilityHandler)`（ガード付き）。既存の close ガード処理はそのまま

- [ ] **Step 4: テスト通過確認**

Run: `npm test`
Expected: 全テスト PASS（既存 audio-manager テストも含む）

- [ ] **Step 5: Commit**

```bash
git add shared/audio-manager.js shared/audio-manager.test.js
git commit -m "feat(audio): ページ非表示時の AudioContext suspend/resume を追加 (#37)"
```

---

### Task 3: element-symbol-puzzle を root vitest に統合（jest 廃止）

**Files:**
- Modify: `vitest.config.js`（exclude から `'**/element-symbol-puzzle/**'` を削除）、`element-symbol-puzzle/config/tsconfig.json`
- Delete: `element-symbol-puzzle/config/jest.config.js`、`element-symbol-puzzle/package.json`、`element-symbol-puzzle/package-lock.json`
- Modify（機械的置換）: `element-symbol-puzzle/__tests__/**` の `jest.` → `vi.`

**Interfaces:**
- Consumes: root `package.json`（vitest 5 / jsdom 済み）
- Produces: Task 4 が触るテストファイル群が vitest で実行可能。root `devDependencies` に `fast-check` 追加

- [ ] **Step 1: 現状のテスト数を記録**

```bash
npx vitest run 2>&1 | tail -5   # esp 除外状態のルートテスト数
npx jest --config element-symbol-puzzle/config/jest.config.js 2>&1 | tail -5  # esp側（要 esp deps; 入っていなければスキップして Step 2 の vitest 統合後の数を基準にする）
```
esp の jest がローカルで動かない場合（node_modules 未取得）は、esp テストファイルの `it(`/`test(` を `grep -c` で数えて概数を記録する。

- [ ] **Step 2: fast-check 追加と exclude 削除**

```bash
npm install -D fast-check
```
`vitest.config.js` の `exclude` 配列から `'**/element-symbol-puzzle/**',` の行を削除。

- [ ] **Step 3: jest → vi 機械的置換**

```bash
grep -rl 'jest\.' element-symbol-puzzle/__tests__ | xargs sed -i '' 's/jest\./vi./g'
```
置換後に `grep -rn 'jest\.' element-symbol-puzzle/__tests__` で 0 件を確認（`@types/jest` 系の import があれば `vitest` の `vi` に寄せる。型位置の `vi.Mock` は vitest が型チェックしないためランタイムには影響しない）。

- [ ] **Step 4: jest 関連ファイル削除 + tsconfig 最小化**

```bash
git rm element-symbol-puzzle/config/jest.config.js element-symbol-puzzle/package.json element-symbol-puzzle/package-lock.json
```
`element-symbol-puzzle/config/tsconfig.json` はエディタ型チェック用として残し、`"types": ["jest", "node"]` を削除、`include` から `"../__tests__/**/*.ts"` を削除（`"types"` キーごと消してよい）。

- [ ] **Step 5: 全テスト実行**

Run: `npm test`
Expected: ルート + esp（unit / integration / properties）全部 PASS。esp のテストがここで初めて root vitest で動く。fail した場合は置換漏れ（`jest.` 残存）や fast-check import 形式（`import * as fc` / `import fc` 両方あり。v4 はどちらも可）を確認して修正

- [ ] **Step 6: Commit**

```bash
git add -A ':!.serena'
git commit -m "refactor(esp): jest を廃止し root vitest に統合 (#37)"
```

---

### Task 4: 巨大テストファイルの分割

**Files:**
- Split: `element-symbol-puzzle/__tests__/unit/RewardSystem.test.ts`（1,295行 → 5ファイル）
- Split: `element-symbol-puzzle/__tests__/unit/UIComponents.test.ts`（1,156行 → 7ファイル）
- Split: `element-symbol-puzzle/__tests__/unit/GameEngine.test.ts`（999行 → 5ファイル）
- Delete: 上記3元ファイル

**Interfaces:**
- Consumes: Task 3 で vitest 化済みのテスト
- Produces: フラットな `__tests__/unit/*.test.ts` を既存13本から27本へ（既存10本が残り + 新17本 = 27）。命名は `<対象>.<観点>.test.ts`

- [ ] **Step 1: 分割前のテスト総数を記録**

Run: `npx vitest run element-symbol-puzzle 2>&1 | tail -5`
Expected: テスト総数をメモ（例: `Tests  N passed`）

- [ ] **Step 2: RewardSystem.test.ts を5ファイルへ**

top-level / 第一階層 describe 単位で、**テストコードは無編集で移動**（各ファイルに必要な import・beforeEach・ヘルパーは元ファイルの該当範囲から複製）:

- `RewardSystem.badgeCriteria.test.ts` ← `checkBadgeCriteria`（L20）+ `Badge Criteria Evaluation - All Badge Types`（L515）
- `RewardSystem.badgeAwarding.test.ts` ← `awardBadge`（L242）+ `getUnlockedBadges`（L286）+ `Badge Awarding and Tracking`（L776）+ `Multiple Badge Scenarios`（L970）
- `RewardSystem.streak.test.ts` ← `getStreakDays`（L320）+ `Consecutive Learning Days Calculation`（L857）
- `RewardSystem.achievements.test.ts` ← `getAchievements`（L371）
- `RewardSystem.integration.test.ts` ← `Integration with ProgressTrackingSystem`（L412）+ `Edge cases`（L469）+ `Error Handling and Edge Cases`（L1108）

- [ ] **Step 3: UIComponents.test.ts を7ファイルへ**

top-level describe がコンポーネント単位なので1対1で:
`MatchingGameUI.test.ts`（L20）/ `QuizGameUI.test.ts`（L182）/ `ChemicalFormulaPuzzleUI.test.ts`（L339）/ `PeriodicTableJigsawUI.test.ts`（L512）/ `ProgressTrackingUI.test.ts`（L800）/ `FeedbackUI.test.ts`（L974）/ `RewardNotificationUI.test.ts`（L1063）— 各 describe の冒頭行番号から次 describe の直前まで。

- [ ] **Step 4: GameEngine.test.ts を5ファイルへ**

- `GameEngine.session.test.ts` ← `Session Initialization`（L11）
- `GameEngine.answer-validation.test.ts` ← `Answer Validation`（L203）
- `GameEngine.scoring.test.ts` ← `Score Calculation`（L391）
- `GameEngine.flow.test.ts` ← `Game Flow Transitions`（L564）
- `GameEngine.difficulty.test.ts` ← `Difficulty Adjustment Integration`（L772）

- [ ] **Step 5: 元ファイル削除 + テスト数一致確認**

```bash
git rm element-symbol-puzzle/__tests__/unit/RewardSystem.test.ts \
       element-symbol-puzzle/__tests__/unit/UIComponents.test.ts \
       element-symbol-puzzle/__tests__/unit/GameEngine.test.ts
npx vitest run element-symbol-puzzle 2>&1 | tail -5
```
Expected: テスト総数が Step 1 の記録と**一致**。減っていたら describe ブロックの移動漏れ

- [ ] **Step 6: Commit**

```bash
git add -A ':!.serena'
git commit -m "test(esp): 巨大テストファイルを機能単位に分割 (#37)"
```

---

### Task 5: element-symbol-puzzle 公開ページ

**Files:**
- Create: `element-symbol-puzzle/main.ts`、`element-symbol-puzzle/index.html`、`element-symbol-puzzle/vite.config.ts`
- Modify: `package.json`（scripts に `build:esp`）、`ages-9-10.html`、`all-ages.html`
- Delete: `element-symbol-puzzle/dist/` の旧 tsc 生成物 28 ファイル（git rm）
- Create（コミット対象）: `element-symbol-puzzle/dist/app.js`

**Interfaces:**
- Consumes: `GameOrchestrator`（`element-symbol-puzzle/GameOrchestrator.ts`）、`MatchingGameUI` / `QuizGameUI` / `ChemicalFormulaPuzzleUI` / `PeriodicTableJigsawUI`（`src/ui/UIComponents.ts`、いずれも `render(): HTMLElement` / `destroy(): void`）。`GameEngine` の `startSession` / `startMatchingSession` / `startQuizSession` / `submitAnswer` / `submitQuizAnswer` / `getNextQuestion` / `endSession`（実 API はソースで確認して合わせる）
- Produces: `npm run build:esp` → `element-symbol-puzzle/dist/app.js`（IIFE、単一ファイル）。`ages-9-10.html` / `all-ages.html` から `element-symbol-puzzle/index.html` へのカードリンク

- [ ] **Step 1: main.ts を作る**

4 モード（マッチング / クイズ / 化学式 / 周期表ジグソー）のボタン + `#app` コンテナを持つ最小 UI。モード選択で対応する UIComponents をインスタンス化して `#app` に appendChild、切替時に既存 UI の `destroy()` を呼ぶ。スコープ: 既存クラスの呼び出しと DOM 組み立てのみで、ゲームロジックの新規実装はしない。詳細な API は `GameOrchestrator.ts`・`src/ui/UIComponents.ts` を読んで合わせる

- [ ] **Step 2: index.html を作る**

サイトのトーン（日本語、子ども向け）に合わせた自己完結ページ。`<script src="dist/app.js"></script>` で読み込み、CSS は `<style>` 内に記述（外部 CSS は作らない）。`<html lang="ja">`、タイトルは「元素記号パズル」

- [ ] **Step 3: vite.config.ts と build:esp を作る**

`element-symbol-puzzle/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'main.ts',
      output: {
        format: 'iife',
        entryFileNames: 'app.js',
      },
    },
  },
});
```

root `package.json` の scripts に追加: `"build:esp": "vite build --config element-symbol-puzzle/vite.config.ts"`

- [ ] **Step 4: 旧 dist 削除 + ビルド**

```bash
git rm -r element-symbol-puzzle/dist
npm run build:esp
git add element-symbol-puzzle/dist/app.js
```
Expected: `dist/app.js` が生成され、`app.js` 内に `import` 文が含まれないこと（IIFE 確認: `head -3 element-symbol-puzzle/dist/app.js`）

- [ ] **Step 5: AGES ページにカード追加**

`ages-9-10.html` と `all-ages.html` のゲームカード並びに、既存カードのマークアップ形式を真似た「元素記号パズル」カードを追加（`href="element-symbol-puzzle/index.html"`、説明文は元素記号と化学式の学習ゲームであることが伝わる1文）。トップ `index.html` は触らない

- [ ] **Step 6: 検証**

```bash
npm run build:esp && npm test
```
Expected: ビルド成功、全テスト PASS。ブラウザ（または `npx vite preview --config element-symbol-puzzle/vite.config.ts`）で `element-symbol-puzzle/index.html` を開き、マッチングモードが起動して回答ボタンが動くことを目視確認（Playwright 可）

- [ ] **Step 7: Commit**

```bash
git add -A ':!.serena'
git commit -m "feat(esp): 元素記号パズルの公開ページを追加 (#37)"
```

---

### Task 6: 最終検証 + PR 作成

**Files:** 変更なし（検証と PR のみ）。問題が見つかったら該当タスクに戻って修正

- [ ] **Step 1: 全体検証**

```bash
npm test                      # 全テスト PASS
npm run build:esp             # ビルド成功
grep -rhoE '(src|href)="[^"]+"' --include="*.html" . | grep -v http | sort -u   # 全参照が実在パス
git status --short            # .serena 以外の意図しない変更がないか
```

- [ ] **Step 2: ブラウザ確認（既存エラー増減ゼロ基準）**

`index.html` → `ages-9-10.html` → `element-symbol-puzzle/index.html` を開き、コンソールエラーが「main-1 時点と比べて増えていない」ことを確認（kanji-puzzle の既存エラーは許容）

- [ ] **Step 3: PR 作成**

```bash
git push -u origin refactor/37-root-structure
gh pr create --base main-1 --title "refactor: ルート構造の整理と element-symbol-puzzle の公開 (#37)" --body "<下記テンプレ>"
```

PR 本文: コミット履歴全体（`git diff main-1...HEAD --stat` ベース）から要約、各タスクの説明、テスト計画（npm test / build:esp / 参照解決 grep / ブラウザ確認の結果）、`Closes #37`、kanji-puzzle 既存不具合は別 issue 追送の注記を含める

- [ ] **Step 4: 別 issue 作成**

kanji-puzzle.js の未ガード require ブラウザ即死バグを `gh issue create` で起票（`Games` ラベル等は実情に合わせ、本文に再現手順と `kanji-puzzle.js:9` の該当箇所を書く）
