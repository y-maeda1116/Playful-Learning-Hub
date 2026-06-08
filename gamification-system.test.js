/**
 * ゲーミフィケーションシステムのテスト
 * Tests for GamificationSystem
 */

const { GamificationSystem } = require('./gamification-system.js');

describe('GamificationSystem', () => {
    let gamification;
    let mockProgressTracker;
    let mockBadgeSystem;

    beforeEach(() => {
        mockProgressTracker = {
            loadProgress: vi.fn(),
        };
        mockBadgeSystem = {};
        gamification = new GamificationSystem(mockProgressTracker, mockBadgeSystem);
    });

    afterEach(() => {
        gamification.destroy();
    });

    describe('初期化', () => {
        test('インスタンスが正しく作成される', () => {
            expect(gamification.progressTracker).toBe(mockProgressTracker);
            expect(gamification.badgeSystem).toBe(mockBadgeSystem);
            expect(gamification.currentStreak).toBe(0);
            expect(gamification.maxStreak).toBe(0);
        });

        test('デフォルトオプションが設定される', () => {
            expect(gamification.options.showProgressBars).toBe(true);
            expect(gamification.options.showStreakCounter).toBe(true);
            expect(gamification.options.showLevelSystem).toBe(true);
            expect(gamification.options.showDailyGoals).toBe(true);
            expect(gamification.options.animationEnabled).toBe(true);
        });

        test('カスタムオプションが反映される', () => {
            const custom = new GamificationSystem(mockProgressTracker, mockBadgeSystem, {
                showProgressBars: false,
                animationEnabled: false,
            });

            expect(custom.options.showProgressBars).toBe(false);
            expect(custom.options.animationEnabled).toBe(false);
        });
    });

    describe('レベルシステム', () => {
        test('12レベルが定義されている', () => {
            expect(gamification.levelSystem.levels).toHaveLength(12);
        });

        test('レベル1はXP0で開始', () => {
            expect(gamification.levelSystem.levels[0].level).toBe(1);
            expect(gamification.levelSystem.levels[0].requiredXP).toBe(0);
        });

        test('各レベルが必要なプロパティを持つ', () => {
            gamification.levelSystem.levels.forEach(level => {
                expect(level).toHaveProperty('level');
                expect(level).toHaveProperty('name');
                expect(level).toHaveProperty('requiredXP');
                expect(level).toHaveProperty('icon');
                expect(level).toHaveProperty('color');
            });
        });

        test('XP0でレベル1が取得される', () => {
            const level = gamification.levelSystem.getCurrentLevel(0);

            expect(level.level).toBe(1);
            expect(level.name).toBe('ひらがな初心者');
        });

        test('XP100でレベル2が取得される', () => {
            const level = gamification.levelSystem.getCurrentLevel(100);

            expect(level.level).toBe(2);
        });

        test('XP500でレベル4が取得される', () => {
            const level = gamification.levelSystem.getCurrentLevel(500);

            expect(level.level).toBe(4);
        });

        test('XP10000でレベル12が取得される', () => {
            const level = gamification.levelSystem.getCurrentLevel(10000);

            expect(level.level).toBe(12);
        });

        test('次のレベルが正しく取得される', () => {
            const current = gamification.levelSystem.levels[0];
            const next = gamification.levelSystem.getNextLevel(current);

            expect(next).toBeDefined();
            expect(next.level).toBe(2);
        });

        test('最高レベルの次はnull', () => {
            const max = gamification.levelSystem.levels[11];
            const next = gamification.levelSystem.getNextLevel(max);

            expect(next).toBeNull();
        });
    });

    describe('経験値計算', () => {
        test('習得文字数が経験値に反映される', () => {
            const progress = {
                masteredCharacters: ['あ', 'い', 'う'],
                sessions: [],
                characterStats: {},
                consecutiveDays: 0,
                badges: [],
            };

            const xp = gamification.levelSystem.calculateXP(progress);

            expect(xp).toBe(150); // 3文字 × 50
        });

        test('セッション完了が経験値に反映される', () => {
            const progress = {
                masteredCharacters: [],
                sessions: [{ id: 's1' }, { id: 's2' }],
                characterStats: {},
                consecutiveDays: 0,
                badges: [],
            };

            const xp = gamification.levelSystem.calculateXP(progress);

            expect(xp).toBe(20); // 2セッション × 10
        });

        test('正答が経験値に反映される', () => {
            const progress = {
                masteredCharacters: [],
                sessions: [],
                characterStats: {
                    'あ': { correctAttempts: 5 },
                },
                consecutiveDays: 0,
                badges: [],
            };

            const xp = gamification.levelSystem.calculateXP(progress);

            expect(xp).toBe(10); // 5正答 × 2
        });

        test('連続日数が経験値に反映される', () => {
            const progress = {
                masteredCharacters: [],
                sessions: [],
                characterStats: {},
                consecutiveDays: 4,
                badges: [],
            };

            const xp = gamification.levelSystem.calculateXP(progress);

            expect(xp).toBe(100); // 4日 × 25
        });

        test('バッジが経験値に反映される', () => {
            const progress = {
                masteredCharacters: [],
                sessions: [],
                characterStats: {},
                consecutiveDays: 0,
                badges: ['first-session', 'week-streak'],
            };

            const xp = gamification.levelSystem.calculateXP(progress);

            expect(xp).toBe(200); // 2バッジ × 100
        });

        test('全要素の合計経験値が正しい', () => {
            const progress = {
                masteredCharacters: ['あ'],
                sessions: [{ id: 's1' }],
                characterStats: { 'あ': { correctAttempts: 3 } },
                consecutiveDays: 2,
                badges: ['first-session'],
            };

            const xp = gamification.levelSystem.calculateXP(progress);
            // 50 + 10 + 6 + 50 + 100 = 216
            expect(xp).toBe(216);
        });
    });

    describe('日次目標', () => {
        test('日次目標が定義されている', () => {
            expect(gamification.dailyGoals).toBeDefined();
            expect(gamification.dailyGoals.goals).toBeDefined();
            expect(gamification.dailyGoals.goals.length).toBeGreaterThan(0);
        });

        test('各目標が必要なプロパティを持つ', () => {
            gamification.dailyGoals.goals.forEach(goal => {
                expect(goal).toHaveProperty('id');
                expect(goal).toHaveProperty('name');
                expect(goal).toHaveProperty('description');
                expect(goal).toHaveProperty('target');
                expect(goal).toHaveProperty('reward');
            });
        });
    });

    describe('フォーマット', () => {
        test('0またはnullは0分', () => {
            expect(gamification.formatPlayTime(0)).toBe('0分');
            expect(gamification.formatPlayTime(null)).toBe('0分');
        });

        test('5秒は0分', () => {
            // GamificationSystem の formatPlayTime は分単位
            expect(gamification.formatPlayTime(5000)).toBe('0分');
        });

        test('2分5秒は2分', () => {
            expect(gamification.formatPlayTime(125000)).toBe('2分');
        });

        test('時間分が正しくフォーマットされる', () => {
            expect(gamification.formatPlayTime(3660000)).toBe('1時間1分');
        });
    });

    describe('全体正答率', () => {
        test('正答率が正しく計算される', () => {
            const progress = {
                characterStats: {
                    'あ': { correctAttempts: 8, totalAttempts: 10 },
                    'い': { correctAttempts: 6, totalAttempts: 10 },
                },
            };

            const accuracy = gamification.calculateOverallAccuracy(progress);

            expect(accuracy).toBe(70); // (8+6)/(10+10) * 100
        });

        test('統計なしでは0%', () => {
            const progress = { characterStats: {} };

            expect(gamification.calculateOverallAccuracy(progress)).toBe(0);
        });
    });

    describe('進捗可視化UI', () => {
        test('進捗可視化コンテナが作成される', () => {
            const container = document.createElement('div');
            mockProgressTracker.loadProgress.mockReturnValue({
                masteredCharacters: [],
                weakCharacters: [],
                characterStats: {},
                sessions: [],
                consecutiveDays: 0,
                totalPlayTime: 0,
                badges: [],
            });

            gamification.createProgressVisualization(container);

            // コンテナ内に何らかのUI要素が作成されることを確認
            expect(container.children.length).toBeGreaterThan(0);
        });
    });
});
