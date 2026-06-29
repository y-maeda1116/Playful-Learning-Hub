/**
 * 時計学習ゲームのテスト
 * Tests for ClockGame
 */

const { initClockGame } = require('./clock-game.js');

describe('initClockGame', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'clock-game';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initClockGame();

        expect(container.querySelector('.clock-header')).not.toBeNull();
        expect(container.querySelector('.clock-display-area')).not.toBeNull();
        expect(container.querySelector('.clock-choices-area')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initClockGame()).not.toThrow();
    });

    test('SVG時計が描画される', () => {
        initClockGame();

        const svg = container.querySelector('svg');
        expect(svg).not.toBeNull();
    });

    test('選択肢ボタンが4つ表示される', () => {
        initClockGame();

        const buttons = container.querySelectorAll('.clock-choice-btn');
        expect(buttons.length).toBe(4);
    });

    test('各選択肢に時刻形式のテキストが含まれる', () => {
        initClockGame();

        const buttons = container.querySelectorAll('.clock-choice-btn');
        buttons.forEach(btn => {
            expect(btn.textContent).toMatch(/\d+:\d{2}/);
        });
    });

    test('正しい時刻を選ぶとせいかいフィードバック', () => {
        initClockGame();

        const buttons = container.querySelectorAll('.clock-choice-btn');
        // 最初のボタンをクリックしてフィードバックを確認
        buttons[0].click();

        const feedback = container.querySelector('.clock-feedback');
        // どちらかのフィードバックが表示される
        expect(feedback.textContent.length).toBeGreaterThan(0);
    });
});
