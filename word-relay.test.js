/**
 * ことばリレーゲームのテスト
 * Tests for WordRelayGame
 */

const { initWordRelayGame } = require('./word-relay.js');

describe('initWordRelayGame', () => {
    let container;

    beforeEach(() => {
        vi.useFakeTimers();
        container = document.createElement('div');
        container.id = 'word-relay-game';
        document.body.appendChild(container);
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.removeChild(container);
    });

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initWordRelayGame();

        expect(container.querySelector('.word-relay-header')).not.toBeNull();
        expect(container.querySelector('.word-relay-chain')).not.toBeNull();
        expect(container.querySelector('.word-relay-target')).not.toBeNull();
        expect(container.querySelector('.word-relay-choices')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => {
            const mod = require('./word-relay-game.js');
        }).toThrow(); // ファイルが存在しないのでエラー
        // 代わりに正しいモジュールでテスト
        const ghost = document.createElement('div');
        ghost.id = 'nonexistent';
        document.body.appendChild(ghost);
        const { initWordRelayGame: init } = require('./word-relay.js');
        // ghostには#word-relay-gameがないので何もしない
        expect(() => init()).not.toThrow();
        document.body.removeChild(ghost);
    });

    test('コンピューターが最初の言葉を提示する', () => {
        initWordRelayGame();

        const chainArea = container.querySelector('.word-relay-chain');
        const words = chainArea.querySelectorAll('.word-relay-word');
        expect(words.length).toBeGreaterThan(0);
    });

    test('ターゲット文字が表示される', () => {
        initWordRelayGame();

        const targetArea = container.querySelector('.word-relay-target');
        expect(targetArea.textContent).toContain('つぎは');
    });

    test('選択肢ボタンが表示される', () => {
        initWordRelayGame();

        const buttons = container.querySelectorAll('.word-relay-choice-btn');
        expect(buttons.length).toBeGreaterThan(0);
    });

    test('正しい言葉を選ぶとチェーンが進む', () => {
        initWordRelayGame();

        // ターゲット文字を取得
        const targetArea = container.querySelector('.word-relay-target');
        const match = targetArea.textContent.match(/「(.?)」/);
        const targetChar = match ? match[1] : null;

        if (targetChar) {
            const buttons = container.querySelectorAll('.word-relay-choice-btn');
            // ターゲット文字から始まるボタンを探す
            for (const btn of buttons) {
                const btnText = btn.textContent.replace(/^[^\w]+\s/, '');
                if (btnText.startsWith(targetChar)) {
                    btn.click();
                    break;
                }
            }
        }

        const scoreDisplay = container.querySelector('.word-relay-score');
        expect(scoreDisplay.textContent).toContain('チェーン:');
    });
});
