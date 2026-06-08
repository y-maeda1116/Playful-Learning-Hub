/**
 * 進捗表示統合機能のテスト
 * Tests for ProgressIntegration
 */

const { ProgressIntegration } = require('./progress-integration.js');

describe('ProgressIntegration', () => {
    let integration;

    beforeEach(() => {
        const container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        const summaryContainer = document.createElement('div');
        summaryContainer.id = 'summary-container';
        document.body.appendChild(summaryContainer);

        const parentControls = document.createElement('div');
        parentControls.id = 'parent-controls';
        document.body.appendChild(parentControls);

        integration = new ProgressIntegration();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        integration = null;
    });

    describe('初期化', () => {
        test('インスタンスが正しく作成される', () => {
            expect(integration).toBeDefined();
            expect(integration.isInitialized).toBe(false);
            expect(integration.progressTracker).toBeNull();
            expect(integration.progressDisplay).toBeNull();
        });

        test('ProgressTracker未定義時は初期化に失敗する', () => {
            const result = integration.initialize();

            expect(result).toBe(false);
            expect(integration.isInitialized).toBe(false);
        });

        test('二重初期化が防止される', () => {
            integration.isInitialized = true;
            const result = integration.initialize();

            expect(result).toBeUndefined();
        });
    });

    describe('保護者向け進捗表示', () => {
        test('未初期化状態では null が返される', () => {
            const result = integration.createParentProgressDisplay('test-container');

            expect(result).toBeNull();
        });

        test('初期化済みでProgressDisplay未定義時は null が返される', () => {
            integration.isInitialized = true;
            integration.progressTracker = {};

            const result = integration.createParentProgressDisplay('test-container');

            expect(result).toBeNull();
        });

        test('存在しないコンテナIDでは null が返される', () => {
            integration.isInitialized = true;
            integration.progressTracker = {};

            const result = integration.createParentProgressDisplay('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('ゲーム連携', () => {
        test('未初期化状態では連携に失敗する', () => {
            const result = integration.connectGameToProgress({});

            expect(result).toBe(false);
        });

        test('progressTracker未設定では連携に失敗する', () => {
            integration.isInitialized = true;

            const result = integration.connectGameToProgress({});

            expect(result).toBe(false);
        });

        test('null ゲームでは連携は成功するがイベントリスナーは設定されない', () => {
            integration.isInitialized = true;
            integration.progressTracker = {
                startSession: vi.fn(),
            };

            const result = integration.connectGameToProgress(null);

            // nullゲームでも接続自体は成功（イベントリスナーは設定されない）
            expect(result).toBe(true);
            expect(integration.progressTracker.startSession).not.toHaveBeenCalled();
        });

        test('有効なゲームで連携が成功する', () => {
            integration.isInitialized = true;
            integration.progressTracker = {
                startSession: vi.fn(),
            };

            const mockGame = {
                ageGroup: '3-4',
                mode: 'hiragana',
            };

            const result = integration.connectGameToProgress(mockGame);

            expect(result).toBe(true);
            expect(integration.progressTracker.startSession).toHaveBeenCalledWith('3-4', 'hiragana');
        });

        test('イベント付きゲームでイベントリスナーが設定される', () => {
            integration.isInitialized = true;
            integration.progressTracker = {
                startSession: vi.fn(),
                recordAttempt: vi.fn(),
                endSession: vi.fn(),
            };

            const listeners = {};
            const mockGame = {
                ageGroup: '5-6',
                mode: 'katakana',
                on: vi.fn((event, callback) => {
                    listeners[event] = callback;
                }),
            };

            integration.connectGameToProgress(mockGame);

            expect(mockGame.on).toHaveBeenCalledWith('answer', expect.any(Function));
            expect(mockGame.on).toHaveBeenCalledWith('sessionEnd', expect.any(Function));

            listeners.answer({ character: 'ア', isCorrect: true, responseTime: 1500 });
            expect(integration.progressTracker.recordAttempt).toHaveBeenCalledWith('ア', true, 1500);

            listeners.sessionEnd();
            expect(integration.progressTracker.endSession).toHaveBeenCalled();
        });
    });

    describe('進捗サマリー表示', () => {
        test('存在しないコンテナでは何もしない', () => {
            integration.showProgressSummary('non-existent');

            const container = document.getElementById('summary-container');
            expect(container.textContent).toBe('');
        });

        test('progressTracker未設定時は「データなし」メッセージが表示される', () => {
            integration.showProgressSummary('summary-container');

            const container = document.getElementById('summary-container');
            expect(container.textContent).toContain('学習データがありません');
        });

        test('セッションなしの進捗データでは学習データなしメッセージが表示される', () => {
            integration.progressTracker = {
                loadProgress: () => ({ sessions: [] }),
            };

            integration.showProgressSummary('summary-container');

            const container = document.getElementById('summary-container');
            expect(container.textContent).toContain('まだ学習データがありません');
        });

        test('有効な進捗データでサマリーが表示される', () => {
            integration.progressTracker = {
                loadProgress: () => ({
                    sessions: [{ id: 's1' }],
                    totalPlayTime: 300000,
                    masteredCharacters: ['あ', 'い'],
                }),
            };

            integration.showProgressSummary('summary-container');

            const container = document.getElementById('summary-container');
            expect(container.textContent).toContain('学習サマリー');
            expect(container.textContent).toContain('1回');
            expect(container.textContent).toContain('5分');
            expect(container.textContent).toContain('2文字');
        });

        test('loadProgress エラー時にエラーメッセージが表示される', () => {
            integration.progressTracker = {
                loadProgress: () => {
                    throw new Error('read error');
                },
            };

            integration.showProgressSummary('summary-container');

            const container = document.getElementById('summary-container');
            expect(container.textContent).toContain('進捗データの読み込みに失敗しました');
        });
    });

    describe('保護者ボタン追加', () => {
        test('ボタンが正しく追加される', () => {
            integration.addParentButton('parent-controls');

            const button = document.querySelector('.parent-progress-button');
            expect(button).not.toBeNull();
            expect(button.textContent).toContain('保護者向け進捗確認');
        });

        test('カスタムボタンテキストが設定される', () => {
            integration.addParentButton('parent-controls', 'テストボタン');

            const button = document.querySelector('.parent-progress-button');
            expect(button.textContent).toBe('テストボタン');
        });

        test('存在しないコンテナでは何もしない', () => {
            expect(() => {
                integration.addParentButton('non-existent');
            }).not.toThrow();
        });

        test('ボタンクリックでモーダルが表示される', () => {
            integration.addParentButton('parent-controls');

            const button = document.querySelector('.parent-progress-button');
            button.click();

            const modal = document.getElementById('parent-progress-modal');
            expect(modal).not.toBeNull();
        });
    });

    describe('保護者向けモーダル', () => {
        test('モーダルが正しく作成される', () => {
            integration.showParentProgressModal();

            const modal = document.getElementById('parent-progress-modal');
            expect(modal).not.toBeNull();
            expect(modal.style.display).toContain('flex');
        });

        test('閉じるボタンでモーダルが閉じる', () => {
            integration.showParentProgressModal();

            const modal = document.getElementById('parent-progress-modal');
            expect(modal).not.toBeNull();

            const closeButton = modal.querySelector('button');
            closeButton.click();

            expect(document.getElementById('parent-progress-modal')).toBeNull();
        });

        test('既存モーダルは新規作成前に削除される', () => {
            integration.showParentProgressModal();

            integration.showParentProgressModal();
            const modals = document.querySelectorAll('#parent-progress-modal');
            expect(modals.length).toBe(1);
        });
    });
});
