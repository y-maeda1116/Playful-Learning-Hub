/**
 * 進捗追跡システムのテスト
 * Tests for ProgressTracker
 */

const { ProgressTracker } = require('./progress-tracker.js');

// localStorage モック（Node.js 25 組み込み localStorage が不完全なため上書き）
const storageStore = {};
const localStorageMock = {
    getItem: (key) => storageStore[key] ?? null,
    setItem: (key, value) => { storageStore[key] = String(value); },
    removeItem: (key) => { delete storageStore[key]; },
    clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); },
    get length() { return Object.keys(storageStore).length; },
    key: (i) => Object.keys(storageStore)[i] ?? null,
};

// globalThis.localStorage をモックで置き換え
globalThis.localStorage = localStorageMock;

describe('ProgressTracker', () => {
    let tracker;
    let uniqueKey;

    beforeEach(() => {
        // テストごとにユニークなキーを使用
        uniqueKey = 'test-progress-' + Math.random().toString(36).slice(2);
        tracker = new ProgressTracker({
            storageKey: uniqueKey,
            userId: 'test-user',
        });
    });

    afterEach(() => {
        if (tracker) {
            tracker.destroy();
        }
    });

    describe('初期化', () => {
        test('インスタンスが正しく作成される', () => {
            expect(tracker.storageKey).toContain('test-progress');
            expect(tracker.userId).toBe('test-user');
            expect(tracker.currentSession).toBeNull();
        });

        test('デフォルト進捗データが作成される', () => {
            const progress = tracker.loadProgress();

            expect(progress).toBeDefined();
            expect(progress.userId).toBe('test-user');
            expect(progress.masteredCharacters).toEqual([]);
            expect(progress.weakCharacters).toEqual([]);
            expect(progress.characterStats).toEqual({});
            expect(progress.totalPlayTime).toBe(0);
            expect(progress.consecutiveDays).toBe(0);
            expect(progress.badges).toEqual([]);
            expect(progress.sessions).toEqual([]);
            expect(progress.version).toBe('1.0');
        });
    });

    describe('セッション管理', () => {
        test('セッションが正しく開始される', () => {
            const sessionId = tracker.startSession('3-4', 'hiragana');

            expect(sessionId).toBeDefined();
            expect(sessionId).toMatch(/^session_/);
            expect(tracker.currentSession).toBeDefined();
            expect(tracker.currentSession.ageGroup).toBe('3-4');
            expect(tracker.currentSession.mode).toBe('hiragana');
            expect(tracker.currentSession.attempts).toEqual([]);
            expect(tracker.currentSession.totalScore).toBe(0);
            expect(tracker.currentSession.totalQuestions).toBe(0);
        });

        test('セッションIDが一意である', () => {
            const id1 = tracker.startSession('3-4', 'hiragana');
            tracker.endSession();
            const id2 = tracker.startSession('5-6', 'katakana');

            expect(id1).not.toBe(id2);
        });

        test('セッションが正しく終了される', () => {
            tracker.startSession('3-4', 'hiragana');
            const summary = tracker.endSession();

            expect(summary).toBeDefined();
            expect(summary.endTime).toBeDefined();
            expect(summary.playTime).toBeGreaterThanOrEqual(0);
            expect(tracker.currentSession).toBeNull();
        });

        test('アクティブセッションなしでendSessionするとnullが返される', () => {
            const result = tracker.endSession();
            expect(result).toBeNull();
        });
    });

    describe('回答記録', () => {
        beforeEach(() => {
            tracker.startSession('3-4', 'hiragana');
        });

        test('正解が正しく記録される', () => {
            const character = { id: 'あ', type: 'hiragana', romaji: 'a' };
            tracker.recordAttempt(character, true, 2000);

            expect(tracker.currentSession.totalQuestions).toBe(1);
            expect(tracker.currentSession.totalScore).toBe(1);
            expect(tracker.currentSession.accuracy).toBe(100);
            expect(tracker.currentSession.attempts).toHaveLength(1);
        });

        test('不正解が正しく記録される', () => {
            const character = { id: 'あ', type: 'hiragana', romaji: 'a' };
            tracker.recordAttempt(character, false, 3000);

            expect(tracker.currentSession.totalQuestions).toBe(1);
            expect(tracker.currentSession.totalScore).toBe(0);
            expect(tracker.currentSession.accuracy).toBe(0);
        });

        test('複数回答の正答率が正しく計算される', () => {
            const char1 = { id: 'あ', type: 'hiragana', romaji: 'a' };
            const char2 = { id: 'い', type: 'hiragana', romaji: 'i' };
            const char3 = { id: 'う', type: 'hiragana', romaji: 'u' };

            tracker.recordAttempt(char1, true, 1000);
            tracker.recordAttempt(char2, true, 1500);
            tracker.recordAttempt(char3, false, 2000);

            expect(tracker.currentSession.totalQuestions).toBe(3);
            expect(tracker.currentSession.totalScore).toBe(2);
            expect(tracker.currentSession.accuracy).toBeCloseTo(66.67, 1);
        });

        test('アクティブセッションなしでは記録されない', () => {
            tracker.endSession();
            const character = { id: 'あ', type: 'hiragana', romaji: 'a' };

            tracker.recordAttempt(character, true, 1000);

            // エラーが発生せず、セッションも作成されない
            expect(tracker.currentSession).toBeNull();
        });
    });

    describe('文字別統計', () => {
        beforeEach(() => {
            tracker.startSession('3-4', 'hiragana');
        });

        test('文字統計が正しく初期化される', () => {
            const character = { id: 'あ', type: 'hiragana', romaji: 'a' };
            tracker.recordAttempt(character, true, 2000);

            const progress = tracker.loadProgress();
            const stats = progress.characterStats['あ'];

            expect(stats).toBeDefined();
            expect(stats.totalAttempts).toBe(1);
            expect(stats.correctAttempts).toBe(1);
            expect(stats.incorrectAttempts).toBe(0);
            expect(stats.accuracy).toBe(100);
        });

        test('連続正解が正しく追跡される', () => {
            const character = { id: 'あ', type: 'hiragana', romaji: 'a' };

            tracker.recordAttempt(character, true, 1000);
            tracker.recordAttempt(character, true, 1500);
            tracker.recordAttempt(character, true, 2000);

            const progress = tracker.loadProgress();
            const stats = progress.characterStats['あ'];

            expect(stats.consecutiveCorrect).toBe(3);
            expect(stats.maxConsecutiveCorrect).toBe(3);
        });

        test('不正解で連続正解がリセットされる', () => {
            const character = { id: 'あ', type: 'hiragana', romaji: 'a' };

            tracker.recordAttempt(character, true, 1000);
            tracker.recordAttempt(character, true, 1500);
            tracker.recordAttempt(character, false, 2000);

            const progress = tracker.loadProgress();
            const stats = progress.characterStats['あ'];

            expect(stats.consecutiveCorrect).toBe(0);
            expect(stats.maxConsecutiveCorrect).toBe(2);
        });

        test('平均応答時間が正しく計算される', () => {
            const character = { id: 'あ', type: 'hiragana', romaji: 'a' };

            tracker.recordAttempt(character, true, 2000);
            tracker.recordAttempt(character, true, 4000);

            const progress = tracker.loadProgress();
            const stats = progress.characterStats['あ'];

            expect(stats.averageResponseTime).toBe(3000);
        });
    });

    describe('習得レベル計算', () => {
        test('全問正解で高い習得レベル', () => {
            const stats = {
                accuracy: 100,
                maxConsecutiveCorrect: 10,
                totalAttempts: 20,
            };

            const level = tracker.calculateMasteryLevel(stats);

            expect(level).toBeGreaterThan(80);
            expect(level).toBeLessThanOrEqual(100);
        });

        test('低正答率で低い習得レベル', () => {
            const stats = {
                accuracy: 20,
                maxConsecutiveCorrect: 1,
                totalAttempts: 2,
            };

            const level = tracker.calculateMasteryLevel(stats);

            expect(level).toBeLessThan(50);
        });

        test('習得レベルは100を超えない', () => {
            const stats = {
                accuracy: 100,
                maxConsecutiveCorrect: 100,
                totalAttempts: 1000,
            };

            const level = tracker.calculateMasteryLevel(stats);

            expect(level).toBeLessThanOrEqual(100);
        });
    });

    describe('習得文字・苦手文字', () => {
        beforeEach(() => {
            tracker.startSession('3-4', 'hiragana');
        });

        test('習得レベル80%以上で習得文字に追加', () => {
            const character = { id: 'あ', type: 'hiragana', romaji: 'a' };

            // 高い正答率を維持
            for (let i = 0; i < 15; i++) {
                tracker.recordAttempt(character, true, 1000);
            }

            const progress = tracker.loadProgress();

            expect(progress.masteredCharacters).toContain('あ');
        });

        test('正答率50%未満かつ5回以上で苦手文字に追加', () => {
            const character = { id: 'か', type: 'hiragana', romaji: 'ka' };

            for (let i = 0; i < 5; i++) {
                tracker.recordAttempt(character, false, 3000);
            }

            const progress = tracker.loadProgress();

            expect(progress.weakCharacters).toContain('か');
        });

        test('習得文字は苦手リストから削除される', () => {
            const character = { id: 'さ', type: 'hiragana', romaji: 'sa' };

            // まず苦手にする
            for (let i = 0; i < 5; i++) {
                tracker.recordAttempt(character, false, 3000);
            }

            // その後習得する
            for (let i = 0; i < 20; i++) {
                tracker.recordAttempt(character, true, 1000);
            }

            const progress = tracker.loadProgress();

            expect(progress.masteredCharacters).toContain('さ');
            expect(progress.weakCharacters).not.toContain('さ');
        });
    });

    describe('進捗レポート', () => {
        test('空の進捗でレポートが生成される', () => {
            const report = tracker.generateProgressReport();

            expect(report).toBeDefined();
            expect(report.userId).toBe('test-user');
            expect(report.totalSessions).toBe(0);
            expect(report.masteredCharacters).toBe(0);
            expect(report.weakCharacters).toBe(0);
        });

        test('セッション後のレポートが正しい', () => {
            tracker.startSession('3-4', 'hiragana');
            const char = { id: 'あ', type: 'hiragana', romaji: 'a' };
            tracker.recordAttempt(char, true, 1000);
            tracker.endSession();

            const report = tracker.generateProgressReport();

            expect(report.totalSessions).toBe(1);
            expect(report.overallAccuracy).toBe(100);
        });
    });

    describe('フォーマット', () => {
        test('秒が正しくフォーマットされる', () => {
            expect(tracker.formatPlayTime(5000)).toBe('5秒');
        });

        test('分秒が正しくフォーマットされる', () => {
            expect(tracker.formatPlayTime(125000)).toBe('2分5秒');
        });

        test('時間分が正しくフォーマットされる', () => {
            expect(tracker.formatPlayTime(3660000)).toBe('1時間1分');
        });

        test('0ミリ秒は0秒', () => {
            expect(tracker.formatPlayTime(0)).toBe('0秒');
        });
    });

    describe('インポート/エクスポート', () => {
        test('エクスポートが正しく行われる', () => {
            const exported = tracker.exportProgress();

            expect(exported).toBeDefined();
            expect(exported.userId).toBe('test-user');
            expect(exported.exportDate).toBeDefined();
            expect(exported.version).toBe('1.0');
        });

        test('インポートでデータが復元される', () => {
            const data = {
                userId: 'imported-user',
                masteredCharacters: ['あ'],
                weakCharacters: [],
                characterStats: {},
                sessions: [{ sessionId: 's1' }],
                badges: [],
                totalPlayTime: 1000,
                consecutiveDays: 1,
                lastPlayed: new Date().toISOString(),
            };

            const result = tracker.importProgress(data);

            expect(result).toBe(true);

            const progress = tracker.loadProgress();
            expect(progress.masteredCharacters).toContain('あ');
        });

        test('不正データのインポートは失敗する', () => {
            expect(tracker.importProgress(null)).toBe(false);
            expect(tracker.importProgress('invalid')).toBe(false);
            expect(tracker.importProgress({ userId: 'test' })).toBe(false);
        });
    });

    describe('リセット', () => {
        test('進捗データがリセットされる', () => {
            tracker.startSession('3-4', 'hiragana');
            const char = { id: 'あ', type: 'hiragana', romaji: 'a' };
            tracker.recordAttempt(char, true, 1000);
            tracker.endSession();

            tracker.resetProgress();

            const progress = tracker.loadProgress();
            expect(progress.masteredCharacters).toEqual([]);
            expect(progress.sessions).toEqual([]);
            expect(progress.totalPlayTime).toBe(0);
        });
    });

    describe('バッジ', () => {
        test('初回セッションでバッジが付与される', () => {
            tracker.startSession('3-4', 'hiragana');
            const char = { id: 'あ', type: 'hiragana', romaji: 'a' };
            for (let i = 0; i < 20; i++) {
                tracker.recordAttempt(char, true, 1000);
            }
            tracker.endSession();

            const progress = tracker.loadProgress();

            expect(progress.badges).toContain('first-session');
            expect(progress.badges).toContain('first-hiragana');
        });
    });

    describe('苦手文字特定', () => {
        test('苦手文字の詳細が取得される', () => {
            tracker.startSession('3-4', 'hiragana');
            const char = { id: 'か', type: 'hiragana', romaji: 'ka' };

            for (let i = 0; i < 5; i++) {
                tracker.recordAttempt(char, false, 3000);
            }
            tracker.endSession();

            const weakChars = tracker.identifyWeakCharacters();

            expect(weakChars.length).toBeGreaterThan(0);
            expect(weakChars[0].character).toBe('か');
            expect(weakChars[0].accuracy).toBeLessThan(50);
            expect(weakChars[0].recommendedPractice).toBeDefined();
        });
    });
});
