/**
 * バッジシステムのテスト
 * Tests for BadgeSystem
 */

const { BadgeSystem } = require('./badge-system.js');

describe('BadgeSystem', () => {
    let badgeSystem;
    let mockProgressTracker;

    beforeEach(() => {
        mockProgressTracker = {
            loadProgress: vi.fn(),
            saveProgressData: vi.fn(),
        };
        badgeSystem = new BadgeSystem(mockProgressTracker);
    });

    describe('初期化', () => {
        test('インスタンスが正しく作成される', () => {
            expect(badgeSystem.progressTracker).toBe(mockProgressTracker);
            expect(badgeSystem.notificationQueue).toEqual([]);
            expect(badgeSystem.isShowingNotification).toBe(false);
        });

        test('デフォルトオプションが設定される', () => {
            expect(badgeSystem.options.showNotifications).toBe(true);
            expect(badgeSystem.options.animationDuration).toBe(2000);
            expect(badgeSystem.options.soundEnabled).toBe(true);
        });

        test('カスタムオプションが反映される', () => {
            const custom = new BadgeSystem(mockProgressTracker, {
                showNotifications: false,
                soundEnabled: false,
            });

            expect(custom.options.showNotifications).toBe(false);
            expect(custom.options.soundEnabled).toBe(false);
        });
    });

    describe('バッジ定義', () => {
        test('必須バッジが定義されている', () => {
            const defs = badgeSystem.badgeDefinitions;

            expect(defs['first-session']).toBeDefined();
            expect(defs['first-hiragana']).toBeDefined();
            expect(defs['hiragana-master']).toBeDefined();
            expect(defs['week-streak']).toBeDefined();
            expect(defs['month-streak']).toBeDefined();
            expect(defs['hour-learner']).toBeDefined();
            expect(defs['dedicated-learner']).toBeDefined();
            expect(defs['perfect-session']).toBeDefined();
        });

        test('各バッジが必要なプロパティを持つ', () => {
            const defs = badgeSystem.badgeDefinitions;

            Object.values(defs).forEach(badge => {
                expect(badge).toHaveProperty('id');
                expect(badge).toHaveProperty('name');
                expect(badge).toHaveProperty('description');
                expect(badge).toHaveProperty('icon');
                expect(badge).toHaveProperty('category');
                expect(badge).toHaveProperty('rarity');
                expect(badge).toHaveProperty('checkCondition');
                expect(typeof badge.checkCondition).toBe('function');
            });
        });

        test('バッジカテゴリが正しい', () => {
            const defs = badgeSystem.badgeDefinitions;

            expect(defs['first-session'].category).toBe('milestone');
            expect(defs['first-hiragana'].category).toBe('achievement');
            expect(defs['week-streak'].category).toBe('streak');
            expect(defs['hour-learner'].category).toBe('time');
            expect(defs['perfect-session'].category).toBe('accuracy');
        });

        test('バッジレアリティが定義されている', () => {
            const defs = badgeSystem.badgeDefinitions;
            const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

            Object.values(defs).forEach(badge => {
                expect(validRarities).toContain(badge.rarity);
            });
        });
    });

    describe('バッジ条件チェック', () => {
        test('first-session: セッション1回で解除', () => {
            const check = badgeSystem.badgeDefinitions['first-session'].checkCondition;

            expect(check({ sessions: [] })).toBe(false);
            expect(check({ sessions: [{ id: 's1' }] })).toBe(true);
        });

        test('first-hiragana: ひらがな1文字習得で解除', () => {
            const check = badgeSystem.badgeDefinitions['first-hiragana'].checkCondition;

            const noProgress = {
                masteredCharacters: [],
                characterStats: {},
            };
            expect(check(noProgress)).toBe(false);

            const withHiragana = {
                masteredCharacters: ['あ'],
                characterStats: {
                    'あ': { type: 'hiragana' },
                },
            };
            expect(check(withHiragana)).toBe(true);
        });

        test('hiragana-master: ひらがな25文字習得で解除', () => {
            const check = badgeSystem.badgeDefinitions['hiragana-master'].checkCondition;

            const stats24 = {
                masteredCharacters: Array.from({ length: 24 }, (_, i) => `char_${i}`),
                characterStats: Object.fromEntries(
                    Array.from({ length: 24 }, (_, i) => [`char_${i}`, { type: 'hiragana' }])
                ),
            };
            expect(check(stats24)).toBe(false);

            const stats25 = {
                masteredCharacters: Array.from({ length: 25 }, (_, i) => `char_${i}`),
                characterStats: Object.fromEntries(
                    Array.from({ length: 25 }, (_, i) => [`char_${i}`, { type: 'hiragana' }])
                ),
            };
            expect(check(stats25)).toBe(true);
        });

        test('week-streak: 7日連続で解除', () => {
            const check = badgeSystem.badgeDefinitions['week-streak'].checkCondition;

            expect(check({ consecutiveDays: 6 })).toBe(false);
            expect(check({ consecutiveDays: 7 })).toBe(true);
        });

        test('month-streak: 30日連続で解除', () => {
            const check = badgeSystem.badgeDefinitions['month-streak'].checkCondition;

            expect(check({ consecutiveDays: 29 })).toBe(false);
            expect(check({ consecutiveDays: 30 })).toBe(true);
        });

        test('hour-learner: 1時間学習で解除', () => {
            const check = badgeSystem.badgeDefinitions['hour-learner'].checkCondition;

            expect(check({ totalPlayTime: 3599999 })).toBe(false);
            expect(check({ totalPlayTime: 3600000 })).toBe(true);
        });

        test('perfect-session: 100%正答率で解除', () => {
            const check = badgeSystem.badgeDefinitions['perfect-session'].checkCondition;

            expect(check({ sessions: [{ accuracy: 99 }] })).toBe(false);
            expect(check({ sessions: [{ accuracy: 100 }] })).toBe(true);
        });
    });

    describe('スタンプ定義', () => {
        test('スタンプが定義されている', () => {
            expect(badgeSystem.stampDefinitions).toBeDefined();
            expect(Object.keys(badgeSystem.stampDefinitions).length).toBeGreaterThan(0);
        });

        test('スタンプが必要なプロパティを持つ', () => {
            Object.values(badgeSystem.stampDefinitions).forEach(stamp => {
                expect(stamp).toHaveProperty('id');
                expect(stamp).toHaveProperty('name');
                expect(stamp).toHaveProperty('icon');
            });
        });
    });

    describe('checkAndAwardBadges', () => {
        test('新しいバッジが付与される', () => {
            const progress = {
                sessions: [{ id: 's1' }],
                masteredCharacters: [],
                weakCharacters: [],
                characterStats: {},
                consecutiveDays: 1,
                totalPlayTime: 0,
                badges: [],
            };

            const result = badgeSystem.checkAndAwardBadges(progress);

            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            // checkAndAwardBadges はバッジオブジェクトを返す
            expect(result.some(b => b.id === 'first-session')).toBe(true);
            // progress.badges にも追加される
            expect(progress.badges).toContain('first-session');
        });

        test('既に所持しているバッジは重複付与されない', () => {
            mockProgressTracker.loadProgress.mockReturnValue({
                sessions: [{ id: 's1' }],
                masteredCharacters: [],
                weakCharacters: [],
                characterStats: {},
                consecutiveDays: 1,
                totalPlayTime: 0,
                badges: ['first-session'],
            });

            const result = badgeSystem.checkAndAwardBadges(mockProgressTracker.loadProgress());

            expect(result).not.toContain('first-session');
        });
    });

    describe('レアリティテキスト', () => {
        test('各レアリティにテキストが返される', () => {
            expect(badgeSystem.getRarityText('common')).toBeDefined();
            expect(badgeSystem.getRarityText('uncommon')).toBeDefined();
            expect(badgeSystem.getRarityText('rare')).toBeDefined();
            expect(badgeSystem.getRarityText('epic')).toBeDefined();
            expect(badgeSystem.getRarityText('legendary')).toBeDefined();
        });

        test('不正なレアリティでも文字列が返される', () => {
            expect(badgeSystem.getRarityText('unknown')).toBeDefined();
        });
    });

    describe('通知キュー', () => {
        test('初期状態は空のキュー', () => {
            expect(badgeSystem.notificationQueue).toEqual([]);
            expect(badgeSystem.isShowingNotification).toBe(false);
        });
    });

    describe('バッジコレクションUI', () => {
        test('バッジコレクションが作成される', () => {
            const container = document.createElement('div');
            mockProgressTracker.loadProgress.mockReturnValue({
                badges: [],
                masteredCharacters: [],
                characterStats: {},
            });

            badgeSystem.createBadgeCollection(container);

            expect(container.querySelector('.badge-collection')).not.toBeNull();
        });
    });

    describe('スタンプコレクションUI', () => {
        test('スタンプなしの場合はメッセージが表示される', () => {
            const container = document.createElement('div');
            mockProgressTracker.loadProgress.mockReturnValue({
                badges: [],
                stamps: null,
            });

            badgeSystem.createStampCollection(container);

            expect(container.querySelector('.no-stamps')).not.toBeNull();
        });

        test('スタンプありの場合はコレクションが作成される', () => {
            const container = document.createElement('div');
            mockProgressTracker.loadProgress.mockReturnValue({
                badges: [],
                stamps: [
                    { id: 's1', date: '2024-01-01', name: 'テスト' },
                ],
            });

            badgeSystem.createStampCollection(container);

            expect(container.querySelector('.stamp-collection')).not.toBeNull();
        });
    });
});
