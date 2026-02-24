# 設計ドキュメント：元素記号パズル

## 概要

元素記号パズルは、7～12歳の子供向けに、インタラクティブなパズルベースのアクティビティを通じて化学元素と記号を学ぶために設計された教育ゲームです。システムは既存の「わくわく学びランド」プラットフォームと統合され、日本の小学校理科学習指導要領に沿った学年別の段階的な学習体験を提供します。

システムはJavaScriptで構築され、既存のプラットフォームアーキテクチャに従い、既に導入されているバッジシステム、プロフィール管理、ゲームメカニクスを活用します。

## アーキテクチャ

### システムコンポーネント

```
┌─────────────────────────────────────────────────────────────┐
│              元素記号パズルシステム                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  ゲームエンジン  │  │  進捗追跡        │               │
│  │  - マッチング    │  │  - ストレージ    │               │
│  │  - クイズ        │  │  - 分析          │               │
│  │  - パズル        │  │                  │               │
│  │  - ジグソー      │  │                  │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  コンテンツ      │  │  報酬システム    │               │
│  │  マネージャー    │  │  - バッジ        │               │
│  │  - 元素          │  │  - 連続学習日数  │               │
│  │  - 化学式        │  │                  │               │
│  │  - 周期表        │  │                  │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  UI/UX           │  │  音声システム    │               │
│  │  - レンダリング  │  │  - 発音          │               │
│  │  - フィードバック│  │  - 報酬音        │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### データフロー

1. **元素選択** → 音声再生 + 視覚的フィードバック
2. **ゲームセッション** → 回答送信 → 検証 → フィードバック表示
3. **進捗更新** → ローカルストレージ → 分析計算
4. **報酬トリガー** → バッジ付与 → 通知表示

## コンポーネントとインターフェース

### 1. 元素コンテンツマネージャー

**責務**: すべての化学元素とメタデータを管理

```javascript
interface Element {
  id: string;
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicWeight: number;
  type: 'metal' | 'nonmetal' | 'metalloid';
  category: 'basic' | 'intermediate' | 'advanced';
  gradeLevel: 3 | 4 | 5 | 6;
  pronunciation: string;
  audioUrl: string;
  commonUses: string[];
  properties: {
    state: 'solid' | 'liquid' | 'gas';
    color: string;
    reactivity: 'high' | 'medium' | 'low';
  };
  // 周期表ジグソーパズル用
  periodicTablePosition: {
    period: number;      // 周期（1-7）
    group: number;       // 族（1-18）
    category: string;    // 'alkaliMetal' | 'alkalineEarth' | 'transition' など
  };
}

interface ChemicalFormula {
  id: string;
  formula: string;
  name: string;
  elements: string[];
  gradeLevel: 5 | 6;
  commonUses: string[];
}

interface PeriodicTablePuzzle {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gradeLevel: 5 | 6;
  elements: Element[];
  totalPieces: number;
  description: string;
}
```

**主要メソッド**:
- `getElementsByGrade(grade)`: 指定学年の元素を返す
- `getElementsByCategory(category)`: カテゴリ別の元素を返す
- `getFormulasByGrade(grade)`: 学年別の化学式を返す
- `getAllElements()`: 完全な元素セット（30個）を返す
- `getElementAudio(elementId)`: 発音の音声URLを返す
- `getPeriodicTablePuzzle(difficulty)`: 周期表ジグソーパズルを返す

### 2. ゲームエンジン

**責務**: ゲームセッションとゲームメカニクスを管理

```javascript
interface GameSession {
  sessionId: string;
  gameType: 'matching' | 'quiz' | 'chemicalFormula' | 'periodicTableJigsaw';
  gradeLevel: 3 | 4 | 5 | 6;
  difficulty: 'easy' | 'medium' | 'hard';
  startTime: number;
  elements: Element[];
  currentIndex: number;
  score: number;
  answers: Answer[];
  correctCount: number;
  totalCount: number;
}

interface Answer {
  elementId: string;
  userAnswer: string;
  correct: boolean;
  responseTime: number;
  timestamp: number;
}

interface JigsawPuzzleSession extends GameSession {
  gameType: 'periodicTableJigsaw';
  puzzle: PeriodicTablePuzzle;
  placedPieces: Map<string, {period: number, group: number}>;
  remainingPieces: Element[];
}
```

**主要メソッド**:
- `startSession(gameType, gradeLevel)`: 新しいゲームセッションを初期化
- `submitAnswer(sessionId, answer)`: ユーザー回答を処理
- `getNextQuestion(sessionId)`: 次の質問を取得
- `endSession(sessionId)`: ゲームセッションを完了
- `calculateScore(sessionId)`: 最終スコアを計算
- `placePuzzlePiece(sessionId, elementId, position)`: ジグソーパズルピースを配置

### 3. 進捗追跡システム

**責務**: 学習進捗を追跡・保存

```javascript
interface UserProgress {
  userId: string;
  gradeLevel: 3 | 4 | 5 | 6;
  elementsLearned: {
    [elementId: string]: {
      status: 'not-started' | 'learning' | 'mastered';
      attempts: number;
      correctAttempts: number;
      lastAttempt: number;
    };
  };
  totalSessionTime: number;
  sessionCount: number;
  averageAccuracy: number;
  badges: string[];
  streakDays: number;
  lastSessionDate: number;
  jigsawPuzzlesCompleted: number;
}
```

**主要メソッド**:
- `updateProgress(userId, sessionData)`: セッション後に進捗を更新
- `getProgress(userId)`: ユーザー進捗を取得
- `calculateMasteryLevel(userId)`: 全体的な習熟度を計算
- `getWeakElements(userId)`: 練習が必要な元素を特定
- `saveToLocalStorage(userId, progress)`: 進捗を永続化

### 4. 報酬システム

**責務**: バッジと達成を管理

```javascript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'elements-learned' | 'accuracy' | 'streak' | 'formula-mastery' | 'jigsaw-completed';
    threshold: number;
  };
  gradeLevel: 3 | 4 | 5 | 6;
}

interface Achievement {
  userId: string;
  badgeId: string;
  unlockedDate: number;
  displayNotification: boolean;
}
```

**主要メソッド**:
- `checkBadgeCriteria(userId, sessionData)`: バッジ獲得条件をチェック
- `awardBadge(userId, badgeId)`: ユーザーにバッジを付与
- `getUnlockedBadges(userId)`: ユーザーのバッジを取得
- `getStreakDays(userId)`: 連続学習日数を計算

### 5. UI/UXコンポーネント

**責務**: ゲームインターフェースとフィードバックをレンダリング

```javascript
interface GameUI {
  renderMatchingGame(elements: Element[], options: Element[]): void;
  renderQuizGame(question: string, options: string[]): void;
  renderChemicalFormulaGame(formula: ChemicalFormula, elements: Element[]): void;
  renderPeriodicTableJigsaw(puzzle: PeriodicTablePuzzle, placedPieces: Map): void;
  displayFeedback(correct: boolean, message: string): void;
  displayProgress(current: number, total: number): void;
  displayReward(badge: Badge): void;
  playAudio(audioUrl: string): void;
}
```

## データモデル

### 元素データベース構造

```javascript
const ELEMENTS = {
  // 小学3～4年生（基本 - 15個）
  'H': { symbol: 'H', name: '水素', atomicNumber: 1, gradeLevel: 3, periodicTablePosition: {period: 1, group: 1}, ... },
  'O': { symbol: 'O', name: '酸素', atomicNumber: 8, gradeLevel: 3, periodicTablePosition: {period: 2, group: 16}, ... },
  // ... その他の元素
  
  // 小学5年生（中級 - 10個追加）
  'Si': { symbol: 'Si', name: 'ケイ素', atomicNumber: 14, gradeLevel: 5, periodicTablePosition: {period: 3, group: 14}, ... },
  // ... その他の元素
  
  // 小学6年生（上級 - 5個追加）
  'B': { symbol: 'B', name: 'ホウ素', atomicNumber: 5, gradeLevel: 6, periodicTablePosition: {period: 2, group: 13}, ... },
  // ... その他の元素
};

const PERIODIC_TABLE_PUZZLES = {
  'easy': {
    difficulty: 'easy',
    gradeLevel: 5,
    elements: [/* 基本15個 */],
    totalPieces: 15,
    description: '基本的な元素で周期表を完成させよう'
  },
  'medium': {
    difficulty: 'medium',
    gradeLevel: 5,
    elements: [/* 基本25個 */],
    totalPieces: 25,
    description: '25個の元素で周期表を完成させよう'
  },
  'hard': {
    difficulty: 'hard',
    gradeLevel: 6,
    elements: [/* 全30個 */],
    totalPieces: 30,
    description: '全30個の元素で周期表を完成させよう'
  }
};
```

## 正確性プロパティ

### プロパティ1: 元素マッチング精度
*任意の* ゲームデータベース内の元素と任意のマッチングゲームセッションについて、ユーザーが元素記号を名前に正しくマッチングした場合、システムは回答を正解として記録し、スコアを増加させる必要があります。
**検証対象: 要件 1.2, 1.3**

### プロパティ2: 学年別適切な元素選択
*任意の* 学年レベル（3、4、5、または6）について、そのレベルのゲームセッションが開始された場合、システムはそのレベル以下に指定された元素のみを提示する必要があります。
**検証対象: 要件 1.1, 6.2**

### プロパティ3: クイズ回答検証
*任意の* 元素の性質に関するクイズ質問について、ユーザーが回答を送信した場合、システムは正しい回答に対して検証し、適切なフィードバック（正解/不正解）を提供する必要があります。
**検証対象: 要件 2.2, 2.3**

### プロパティ4: 化学式組成
*任意の* システム内の化学式について、ユーザーが個別の元素から構成しようとした場合、システムは正確な元素の組み合わせのみを受け入れる必要があります。
**検証対象: 要件 3.2, 3.3**

### プロパティ5: 進捗永続化ラウンドトリップ
*任意の* ユーザー進捗データについて、ローカルストレージに保存して取得した場合、取得したデータは元のデータと同等である必要があります（データ損失や破損がない）。
**検証対象: 要件 4.1, 8.5**

### プロパティ6: 正答率ベースの難易度調整
*任意の* ゲームセッションについて、ユーザーの正答率が80%以上に達した場合、次のセッションはより難しい質問を提示する必要があります。正答率が50%未満の場合、次のセッションはより簡単な質問に戻す必要があります。
**検証対象: 要件 6.4, 6.5**

### プロパティ7: バッジ基準一貫性
*任意の* バッジ基準（学習した元素、正答率閾値、連続学習日数）について、ユーザーが基準を満たした場合、システムは対応するバッジを付与する必要があります。基準を満たさない場合、バッジは付与されない必要があります。
**検証対象: 要件 5.1, 5.4**

### プロパティ8: 音声再生利用可能性
*任意の* システム内の元素について、元素が選択または表示された場合、システムは発音用の音声URLを利用可能にする必要があります（または欠落した音声を適切に処理する）。
**検証対象: 要件 7.1, 7.2**

### プロパティ9: 複数プロフィール分離
*任意の* 2つの異なるユーザープロフィールについて、1つのプロフィールの進捗が更新された場合、他のプロフィールのデータは変更されない必要があります。
**検証対象: 要件 4.5, 8.2**

### プロパティ10: 連続学習日数計算
*任意の* 連続学習セッションを持つユーザーについて、連続学習日数カウンターは連続した少なくとも1つの完了セッションを持つ日数を正確に反映する必要があります。
**検証対象: 要件 5.2, 5.4**

### プロパティ11: 周期表ジグソーパズル配置検証
*任意の* 周期表ジグソーパズルセッションについて、ユーザーが元素ピースを配置した場合、システムは正しい周期と族の位置のみを受け入れる必要があります。
**検証対象: 要件 6.1, 6.2, 6.3**

### プロパティ12: ジグソーパズル完成検出
*任意の* 周期表ジグソーパズルについて、すべてのピースが正しく配置された場合、システムはパズル完成を検出し、学習情報を表示する必要があります。
**検証対象: 要件 6.4, 6.5**

## エラーハンドリング

### ゲームセッションエラー

1. **無効な元素選択**: ユーザーが存在しない元素を選択した場合、エラーメッセージを表示して再試行を許可
2. **音声再生失敗**: 音声URLが利用不可の場合、テキストベースのヒントを表示
3. **ローカルストレージ利用不可**: ローカルストレージが利用不可の場合、メモリ内ストレージを使用して警告を表示
4. **セッションタイムアウト**: セッションが30分を超えた場合、進捗を自動保存してプロンプトを表示

### データ検証エラー

1. **破損した進捗データ**: 保存された進捗が破損している場合、デフォルト状態にリセットしてユーザーに通知
2. **無効な学年レベル**: 学年レベルが3～6の範囲外の場合、デフォルトで学年3に設定
3. **欠落した元素メタデータ**: 元素データが不完全な場合、その元素をスキップしてエラーをログ

### UI/UXエラー状態

1. **ネットワークエラー**: オフラインモード通知を表示
2. **レンダリングエラー**: テキストのみのインターフェースにフォールバック
3. **入力検証**: 送信前にUIレベルで無効な入力を防止

## テスト戦略

### デュアルテストアプローチ

システムには包括的なカバレッジのためにユニットテストとプロパティベーステストの両方が必要です：

- **ユニットテスト**: 特定の例、エッジケース、エラー条件を検証
- **プロパティテスト**: すべての入力にわたる普遍的なプロパティを検証
- 両者は相補的で、包括的なカバレッジに必要です

### ユニットテスト

ユニットテストは以下に焦点を当てる必要があります：
- 正しい動作を示す特定の例
- コンポーネント間の統合ポイント
- エッジケースとエラー条件
- エラーハンドリングと復旧

### プロパティベーステスト設定

- 各プロパティテストの最小100回の反復（ランダム化のため）
- 各正確性プロパティは単一のプロパティベーステストで実装
- タグ形式: **機能: element-symbol-puzzle, プロパティ {番号}: {プロパティテキスト}**
- 各プロパティテストは設計ドキュメントのプロパティを参照

## 既存プラットフォームとの統合

### バッジシステム統合

- 元素記号パズルバッジは既存バッジシステムと統合
- バッジはユーザープロフィールと共に表示
- バッジ通知は既存通知システムを使用

### プロフィール管理

- ユーザープロフィールは要素学習進捗を保存
- 複数プロフィールがサポートされ、進捗追跡が分離
- プロフィール切り替えはデータ分離を維持

### UI/UX一貫性

- 既存プラットフォームのカラースキームとタイポグラフィを使用
- 一貫したボタンとインタラクションパターンに従う
- ナビゲーション構造を維持
