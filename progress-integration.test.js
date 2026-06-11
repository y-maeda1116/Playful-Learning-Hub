/**
 * 進捗表示統合機能のテスト
 * Tests for ProgressIntegration
 *
 * Note: The source code uses innerHTML for rendering progress summaries
 * and modals. This is safe in this context as all data comes from the
 * local ProgressTracker (no user-generated HTML).
 */

const { ProgressIntegration } = require('./progress-integration.js');

describe('ProgressIntegration', () => {
    let integration;

    beforeEach(() => {
        integration = new ProgressIntegration();
        global.ProgressTracker = undefined;
        global.ProgressDisplay = undefined;
    });

    afterEach(() => {
        delete global.ProgressTracker;
        delete global.ProgressDisplay;
        document.body.innerHTML = '';
    });

    describe('初期化', () => {
        test('デフォルトプロパティが正しく設定される', () => {
            expect(integration.progressTracker).toBeNull();
            expect(integration.progressDisplay).toBeNull();
            expect(integration.isInitialized).toBe(false);
        });

        test('initialize: ProgressTracker未定義時は false を返す', () => {
            global.ProgressTracker = undefined;

            const result = integration.initialize();

            expect(result).toBe(false);
            expect(integration.isInitialized).toBe(false);
        });

        test('initialize: ProgressTracker定義済みの場合は正常に初期化される', () => {
            global.ProgressTracker = vi.fn().mockImplementation(() => ({
                storageKey: 'test',
                userId: 'default',
            }));

            const result = integration.initialize();

            expect(result).toBe(true);
            expect(integration.isInitialized).toBe(true);
            expect(integration.progressTracker).toBeDefined();
            expect(global.ProgressTracker).toHaveBeenCalledWith({
                storageKey: 'hiragana-learning-progress',
                userId: 'default',
            });
        });

        test('initialize: 既に初期化済みの場合は何もしない', () => {
            integration.isInitialized = true;
            const originalTracker = integration.progressTracker;

            const result = integration.initialize();

            expect(result).toBeUndefined();
            expect(integration.progressTracker).toBe(originalTracker);
        });

        test('initialize: ProgressTrackerコンストラクタで例外発生時は false を返す', () => {
            global.ProgressTracker = vi.fn().mockImplementation(() => {
                throw new Error('Tracker init failed');
            });

            const result = integration.initialize();

            expect(result).toBe(false);
            expect(integration.isInitialized).toBe(false);
        });
    });

    describe('createParentProgressDisplay', () => {
        test('未初期化時は null を返す', () => {
            integration.isInitialized = false;

            const result = integration.createParentProgressDisplay('container');

            expect(result).toBeNull();
        });

        test('コンテナが存在しない場合は null を返す', () => {
            integration.isInitialized = true;

            const result = integration.createParentProgressDisplay('nonexistent');

            expect(result).toBeNull();
        });

        test('ProgressDisplay未定義時は null を返す', () => {
            integration.isInitialized = true;
            integration.progressTracker = {};
            const container = document.createElement('div');
            container.id = 'test-container';
            document.body.appendChild(container);

            global.ProgressDisplay = undefined;

            const result = integration.createParentProgressDisplay('test-container');

            expect(result).toBeNull();
        });

        test('正常時は ProgressDisplay インスタンスを返す', () => {
            integration.isInitialized = true;
            integration.progressTracker = { tracker: true };
            const container = document.createElement('div');
            container.id = 'test-container';
            document.body.appendChild(container);

            const mockDisplay = { display: true };
            global.ProgressDisplay = vi.fn().mockReturnValue(mockDisplay);

            const result = integration.createParentProgressDisplay('test-container');

            expect(result).toBe(mockDisplay);
            expect(global.ProgressDisplay).toHaveBeenCalledWith(
                container,
                integration.progressTracker,
                expect.objectContaining({
                    showDetailedStats: true,
                    showWeakCharacters: true,
                    showBadges: true,
                    refreshInterval: 30000,
                })
            );
        });

        test('カスタムオプションがマージされる', () => {
            integration.isInitialized = true;
            integration.progressTracker = {};
            const container = document.createElement('div');
            container.id = 'test-container';
            document.body.appendChild(container);

            global.ProgressDisplay = vi.fn().mockReturnValue({});

            integration.createParentProgressDisplay('test-container', {
                refreshInterval: 10000,
                customOption: 'value',
            });

            expect(global.ProgressDisplay).toHaveBeenCalledWith(
                container,
                integration.progressTracker,
                expect.objectContaining({
                    refreshInterval: 10000,
                    customOption: 'value',
                    showDetailedStats: true,
                })
            );
        });

        test('ProgressDisplay生成時に例外発生時は null を返す', () => {
            integration.isInitialized = true;
            integration.progressTracker = {};
            const container = document.createElement('div');
            container.id = 'test-container';
            document.body.appendChild(container);

            global.ProgressDisplay = vi.fn().mockImplementation(() => {
                throw new Error('Display creation failed');
            });

            const result = integration.createParentProgressDisplay('test-container');

            expect(result).toBeNull();
        });
    });

    describe('connectGameToProgress', () => {
        test('未初期化時は false を返す', () => {
            integration.isInitialized = false;

            const result = integration.connectGameToProgress({});

            expect(result).toBe(false);
        });

        test('progressTracker未設定時は false を返す', () => {
            integration.isInitialized = true;
            integration.progressTracker = null;

            const result = integration.connectGameToProgress({});

            expect(result).toBe(false);
        });

        test('正常時は true を返す', () => {
            integration.isInitialized = true;
            integration.progressTracker = {};

            const result = integration.connectGameToProgress({});

            expect(result).toBe(true);
        });

        test('例外発生時は false を返す', () => {
            integration.isInitialized = true;
            integration.progressTracker = {};

            integration.setupGameEventListeners = vi.fn().mockImplementation(() => {
                throw new Error('Setup failed');
            });

            const result = integration.connectGameToProgress({});

            expect(result).toBe(false);
        });
    });

    describe('setupGameEventListeners', () => {
        test('game が null の場合は何もしない', () => {
            integration.progressTracker = {
                startSession: vi.fn(),
            };

            integration.setupGameEventListeners(null);

            expect(integration.progressTracker.startSession).not.toHaveBeenCalled();
        });

        test('game の ageGroup と mode がある場合 startSession を呼ぶ', () => {
            integration.progressTracker = {
                startSession: vi.fn(),
            };

            integration.setupGameEventListeners({
                ageGroup: '3-4',
                mode: 'practice',
            });

            expect(integration.progressTracker.startSession).toHaveBeenCalledWith('3-4', 'practice');
        });

        test('game.on が存在する場合イベントリスナーを登録する', () => {
            integration.progressTracker = {
                startSession: vi.fn(),
                recordAttempt: vi.fn(),
                endSession: vi.fn(),
            };

            const listeners = {};
            const game = {
                ageGroup: '5-6',
                mode: 'quiz',
                on: vi.fn((event, callback) => {
                    listeners[event] = callback;
                }),
            };

            integration.setupGameEventListeners(game);

            expect(game.on).toHaveBeenCalledWith('answer', expect.any(Function));
            expect(game.on).toHaveBeenCalledWith('sessionEnd', expect.any(Function));

            // answer イベント発火のテスト
            listeners['answer']({
                character: 'あ',
                isCorrect: true,
                responseTime: 500,
            });
            expect(integration.progressTracker.recordAttempt).toHaveBeenCalledWith('あ', true, 500);

            // responseTime 未指定時のテスト
            listeners['answer']({
                character: 'い',
                isCorrect: false,
            });
            expect(integration.progressTracker.recordAttempt).toHaveBeenCalledWith('い', false, 0);

            // sessionEnd イベント発火のテスト
            listeners['sessionEnd']();
            expect(integration.progressTracker.endSession).toHaveBeenCalled();
        });

        test('ageGroup か mode が未定義の場合は startSession を呼ばない', () => {
            integration.progressTracker = {
                startSession: vi.fn(),
            };

            integration.setupGameEventListeners({ ageGroup: '3-4' });
            expect(integration.progressTracker.startSession).not.toHaveBeenCalled();

            integration.setupGameEventListeners({ mode: 'quiz' });
            expect(integration.progressTracker.startSession).not.toHaveBeenCalled();
        });
    });

    describe('showProgressSummary', () => {
        test('コンテナが存在しない場合は何もしない', () => {
            integration.progressTracker = {};

            expect(() => {
                integration.showProgressSummary('nonexistent');
            }).not.toThrow();
        });

        test('progressTracker が null の場合はメッセージが表示される', () => {
            integration.progressTracker = null;
            const container = document.createElement('div');
            container.id = 'summary-container';
            document.body.appendChild(container);

            integration.showProgressSummary('summary-container');

            expect(container.textContent).toContain('学習データがありません');
        });

        test('進捗データが空の場合はガイドメッセージが表示される', () => {
            integration.progressTracker = {
                loadProgress: vi.fn().mockReturnValue({
                    sessions: [],
                    totalPlayTime: 0,
                    masteredCharacters: [],
                }),
            };
            const container = document.createElement('div');
            container.id = 'summary-container';
            document.body.appendChild(container);

            integration.showProgressSummary('summary-container');

            expect(container.textContent).toContain('まだ学習データがありません');
        });

        test('進捗データが null の場合はガイドメッセージが表示される', () => {
            integration.progressTracker = {
                loadProgress: vi.fn().mockReturnValue(null),
            };
            const container = document.createElement('div');
            container.id = 'summary-container';
            document.body.appendChild(container);

            integration.showProgressSummary('summary-container');

            expect(container.textContent).toContain('まだ学習データがありません');
        });

        test('進捗データがある場合はサマリーが表示される', () => {
            integration.progressTracker = {
                loadProgress: vi.fn().mockReturnValue({
                    sessions: [{ id: 's1' }, { id: 's2' }, { id: 's3' }],
                    totalPlayTime: 180000,
                    masteredCharacters: ['あ', 'い', 'う'],
                }),
            };
            const container = document.createElement('div');
            container.id = 'summary-container';
            document.body.appendChild(container);

            integration.showProgressSummary('summary-container');

            expect(container.textContent).toContain('学習サマリー');
            expect(container.textContent).toContain('3回');
            expect(container.textContent).toContain('3文字');
        });

        test('totalPlayTime が未定義の場合は 0分 として表示される', () => {
            integration.progressTracker = {
                loadProgress: vi.fn().mockReturnValue({
                    sessions: [{ id: 's1' }],
                    masteredCharacters: [],
                }),
            };
            const container = document.createElement('div');
            container.id = 'summary-container';
            document.body.appendChild(container);

            integration.showProgressSummary('summary-container');

            expect(container.textContent).toContain('学習サマリー');
            expect(container.textContent).toContain('0分');
        });

        test('masteredCharacters が未定義の場合は 0文字 として表示される', () => {
            integration.progressTracker = {
                loadProgress: vi.fn().mockReturnValue({
                    sessions: [{ id: 's1' }],
                    totalPlayTime: 60000,
                }),
            };
            const container = document.createElement('div');
            container.id = 'summary-container';
            document.body.appendChild(container);

            integration.showProgressSummary('summary-container');

            expect(container.textContent).toContain('0文字');
        });

        test('loadProgress で例外発生時はエラーメッセージが表示される', () => {
            integration.progressTracker = {
                loadProgress: vi.fn().mockImplementation(() => {
                    throw new Error('Load failed');
                }),
            };
            const container = document.createElement('div');
            container.id = 'summary-container';
            document.body.appendChild(container);

            integration.showProgressSummary('summary-container');

            expect(container.textContent).toContain('進捗データの読み込みに失敗しました');
        });
    });

    describe('addParentButton', () => {
        test('コンテナが存在しない場合は何もしない', () => {
            expect(() => {
                integration.addParentButton('nonexistent');
            }).not.toThrow();
        });

        test('デフォルトボタンテキストでボタンが追加される', () => {
            const container = document.createElement('div');
            container.id = 'btn-container';
            document.body.appendChild(container);

            integration.addParentButton('btn-container');

            const button = container.querySelector('.parent-progress-button');
            expect(button).not.toBeNull();
            expect(button.textContent).toBe('保護者向け進捗確認');
        });

        test('カスタムボタンテキストでボタンが追加される', () => {
            const container = document.createElement('div');
            container.id = 'btn-container';
            document.body.appendChild(container);

            integration.addParentButton('btn-container', 'カスタムテキスト');

            const button = container.querySelector('.parent-progress-button');
            expect(button.textContent).toBe('カスタムテキスト');
        });

        test('ボタンにスタイルが適用される', () => {
            const container = document.createElement('div');
            container.id = 'btn-container';
            document.body.appendChild(container);

            integration.addParentButton('btn-container');

            const button = container.querySelector('.parent-progress-button');
            expect(button.style.background).toContain('76, 175, 80');
            expect(button.style.color).toBe('white');
        });
    });

    describe('showParentProgressModal', () => {
        test('モーダルが DOM に追加される', () => {
            integration.showParentProgressModal();

            const modal = document.getElementById('parent-progress-modal');
            expect(modal).not.toBeNull();
        });

        test('既存のモーダルは削除されてから再作成される', () => {
            integration.showParentProgressModal();

            integration.showParentProgressModal();

            const modals = document.querySelectorAll('#parent-progress-modal');
            expect(modals.length).toBe(1);
        });

        test('モーダル内に progress コンテナが含まれる', () => {
            integration.showParentProgressModal();

            const progressContainer = document.getElementById('modal-progress-container');
            expect(progressContainer).not.toBeNull();
        });

        test('モーダルに閉じるボタンが含まれる', () => {
            integration.showParentProgressModal();

            const modal = document.getElementById('parent-progress-modal');
            const closeButton = modal.querySelector('button');
            expect(closeButton).not.toBeNull();
            expect(closeButton.textContent).toBe('×');
        });

        test('閉じるボタンのクリックでモーダルが削除される', () => {
            integration.showParentProgressModal();

            const modal = document.getElementById('parent-progress-modal');
            expect(modal).not.toBeNull();

            const closeButton = modal.querySelector('button');
            closeButton.dispatchEvent(new MouseEvent('click'));

            expect(document.getElementById('parent-progress-modal')).toBeNull();
        });

        test('モーダル外クリックでモーダルが削除される', () => {
            integration.showParentProgressModal();

            const modal = document.getElementById('parent-progress-modal');
            expect(modal).not.toBeNull();

            modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(document.getElementById('parent-progress-modal')).toBeNull();
        });
    });
});
