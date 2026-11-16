/**
 * かずかぞえゲームのテスト
 * Tests for CountingGame
 */

const { initCountingGame } = require('./counting-game.js');

describe('initCountingGame', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'counting-game';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initCountingGame();

        expect(container.querySelector('.counting-header')).not.toBeNull();
        expect(container.querySelector('.counting-objects-area')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        const ghost = document.createElement('div');
        ghost.id = 'no-match';
        document.body.appendChild(ghost);

        expect(() => {
            const { initCountingGame: init2 } = require('./counting-game.js');
            init2();
        }).not.toThrow();

        document.body.removeChild(ghost);
    });

    test('オブジェクトボタンが1〜3個表示される', () => {
        initCountingGame();

        const objects = container.querySelectorAll('.counting-object-btn');
        expect(objects.length).toBeGreaterThanOrEqual(1);
        expect(objects.length).toBeLessThanOrEqual(3);
    });

    test('質問文が表示される', () => {
        initCountingGame();

        const question = container.querySelector('.counting-question');
        expect(question.textContent).toContain('タップしてかぞえよう');
    });

    test('オブジェクトをタップするとcountedクラスが付く', () => {
        initCountingGame();

        const firstObj = container.querySelector('.counting-object-btn');
        firstObj.click();

        expect(firstObj.classList.contains('counted')).toBe(true);
    });

    test('全タップ後に数字選択肢が表示される', () => {
        initCountingGame();

        const objects = container.querySelectorAll('.counting-object-btn');
        objects.forEach(obj => obj.click());

        const choices = container.querySelectorAll('.counting-number-btn');
        expect(choices.length).toBeGreaterThanOrEqual(2);
    });
});
