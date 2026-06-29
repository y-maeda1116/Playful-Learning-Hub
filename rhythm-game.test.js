/**
 * リズムゲームのテスト
 * Tests for RhythmGame
 */

const { initRhythmGame } = require('./rhythm-game.js');

describe('initRhythmGame', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'rhythm-game';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initRhythmGame();

        expect(container.querySelector('.rhythm-header')).not.toBeNull();
        expect(container.querySelector('.rhythm-buttons-area')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initRhythmGame()).not.toThrow();
    });

    test('4つのカラーボタンが表示される', () => {
        initRhythmGame();

        const btns = container.querySelectorAll('.rhythm-button');
        expect(btns.length).toBe(4);
    });

    test('各ボタンにaria-labelが設定される', () => {
        initRhythmGame();

        const btns = container.querySelectorAll('.rhythm-button');
        const labels = Array.from(btns).map(b => b.getAttribute('aria-label'));
        expect(labels).toContain('あか');
        expect(labels).toContain('あお');
        expect(labels).toContain('みどり');
        expect(labels).toContain('きいろ');
    });

    test('メッセージが表示される', () => {
        initRhythmGame();

        const message = document.getElementById('rhythm-message');
        expect(message).not.toBeNull();
        expect(message.textContent.length).toBeGreaterThan(0);
    });

    test('スコア表示がある', () => {
        initRhythmGame();

        const score = document.getElementById('rhythm-score-display');
        expect(score).not.toBeNull();
        expect(score.textContent).toContain('スコア: 0');
    });
});
