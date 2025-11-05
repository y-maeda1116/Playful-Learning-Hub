# 設計書

## 概要

3歳から6歳の子供向けひらがなとカタカナ学習機能は、既存の「わくわく学びランド」プラットフォームに統合される教育ゲームです。年齢に応じた2つの難易度レベルを提供し、インタラクティブな学習体験を通じて日本語の基礎文字習得を支援します。

## アーキテクチャ

### システム構成

```
hiragana-katakana-learning/
├── hiragana-learning.js          # メインゲームロジック
├── hiragana-learning.test.js     # テストファイル
├── character-data.js             # 文字データ管理
├── progress-tracker.js           # 進捗追跡機能
├── audio-manager.js              # 音声再生管理
└── writing-practice.js           # 文字書き練習機能
```

### 既存システムとの統合

- `ages-3-4.html` にひらがな学習ゲームを追加
- `ages-5-6.html` にひらがな・カタカナ統合学習を追加
- 既存のCSSスタイルシステムを拡張
- 既存のゲーム初期化パターンに従う

## コンポーネントと インターフェース

### 1. HiraganaLearningGame (メインコンポーネント)

**責任:**
- ゲーム全体の状態管理
- 年齢別モードの切り替え
- UI レンダリングの調整

**主要メソッド:**
```javascript
class HiraganaLearningGame {
    constructor(ageGroup, container)
    initializeGame()
    switchMode(mode) // 'hiragana', 'katakana', 'mixed'
    startNewRound()
    handleAnswer(selectedCharacter)
    showProgress()
}
```

### 2. CharacterRecognitionGame (文字認識ゲーム)

**責任:**
- 文字選択クイズの実装
- 選択肢の生成と表示
- 正答判定

**主要メソッド:**
```javascript
class CharacterRecognitionGame {
    generateChoices(targetCharacter, difficulty)
    displayQuestion(character)
    checkAnswer(selectedCharacter)
    playCharacterSound(character)
}
```

### 3. WritingPracticeGame (文字書き練習)

**責任:**
- タッチ/マウス入力による文字なぞり
- 書き順ガイドの表示
- 書字評価

**主要メソッド:**
```javascript
class WritingPracticeGame {
    initializeCanvas()
    showStrokeGuide(character)
    trackDrawing(touchEvents)
    evaluateWriting()
}
```

### 4. ProgressTracker (進捗追跡)

**責任:**
- 学習データの永続化
- 習得状況の分析
- 保護者向けレポート生成

**主要メソッド:**
```javascript
class ProgressTracker {
    saveProgress(character, isCorrect, timeSpent)
    getCharacterMastery(character)
    generateProgressReport()
    identifyWeakCharacters()
}
```

### 5. AudioManager (音声管理)

**責任:**
- 文字音声の再生
- 効果音の管理
- 音声ファイルの遅延読み込み

**主要メソッド:**
```javascript
class AudioManager {
    preloadCharacterSounds(characters)
    playCharacterSound(character)
    playFeedbackSound(type) // 'correct', 'incorrect', 'celebration'
}
```

## データモデル

### Character (文字データ)

```javascript
const Character = {
    id: 'あ',
    type: 'hiragana', // 'hiragana' | 'katakana'
    romaji: 'a',
    strokeOrder: [
        { path: 'M10,20 L30,40', order: 1 },
        { path: 'M15,10 L25,50', order: 2 }
    ],
    audioFile: 'sounds/hiragana/a.mp3',
    difficulty: 1 // 1-3 (1: 基本, 2: 中級, 3: 上級)
}
```

### LearningSession (学習セッション)

```javascript
const LearningSession = {
    sessionId: 'uuid',
    startTime: Date,
    endTime: Date,
    ageGroup: '3-4', // '3-4' | '5-6'
    mode: 'hiragana', // 'hiragana' | 'katakana' | 'mixed'
    attempts: [
        {
            character: 'あ',
            isCorrect: true,
            responseTime: 2500, // ミリ秒
            attemptNumber: 1
        }
    ],
    totalScore: 85
}
```

### UserProgress (ユーザー進捗)

```javascript
const UserProgress = {
    userId: 'default', // 将来の複数ユーザー対応
    masteredCharacters: ['あ', 'い', 'う'],
    weakCharacters: ['え', 'お'],
    totalPlayTime: 3600000, // ミリ秒
    consecutiveDays: 5,
    badges: ['first-hiragana', 'week-streak'],
    lastPlayed: Date
}
```

## エラーハンドリング

### 音声再生エラー

```javascript
// 音声ファイルが利用できない場合の代替手段
if (!audioSupported) {
    displayVisualFeedback(character);
    showTextualPronunciation(character.romaji);
}
```

### ローカルストレージエラー

```javascript
// ストレージが利用できない場合のセッション内記録
try {
    localStorage.setItem('progress', progressData);
} catch (error) {
    console.warn('Progress will not be saved:', error);
    useSessionStorage(progressData);
}
```

### タッチ入力エラー

```javascript
// タッチイベントが利用できない場合のマウス代替
if (!touchSupported) {
    canvas.addEventListener('mousedown', handleDrawStart);
    canvas.addEventListener('mousemove', handleDrawMove);
}
```

## テスト戦略

### 単体テスト

- **文字認識ロジック**: 正答判定の正確性
- **進捗計算**: 習得率計算の正確性
- **データ永続化**: ローカルストレージの読み書き

### 統合テスト

- **ゲームフロー**: 開始から終了までの完全なゲーム体験
- **年齢別モード**: 各年齢グループでの適切な難易度調整
- **音声統合**: 音声再生とゲームロジックの連携

### ユーザビリティテスト

- **タッチ操作**: 小さな指でも操作しやすいUI要素サイズ
- **視覚的フィードバック**: 色覚に配慮したフィードバック設計
- **学習効果**: 実際の文字習得効果の測定

## パフォーマンス考慮事項

### 音声ファイル最適化

- 文字音声ファイルの圧縮（MP3, 32kbps）
- 必要な文字のみの遅延読み込み
- ブラウザキャッシュの活用

### アニメーション最適化

- CSS transformsを使用したハードウェアアクセラレーション
- requestAnimationFrameによるスムーズなアニメーション
- 不要なDOM操作の最小化

### メモリ管理

- 使用済み音声オブジェクトの適切な解放
- Canvas要素のメモリリーク防止
- イベントリスナーの適切なクリーンアップ

## セキュリティ考慮事項

### データプライバシー

- 個人識別情報の収集回避
- ローカルストレージのみでのデータ保存
- 外部サーバーへのデータ送信なし

### コンテンツセキュリティ

- 信頼できるソースからの音声ファイル読み込み
- XSS攻撃を防ぐための入力サニタイゼーション
- CSP（Content Security Policy）の適用