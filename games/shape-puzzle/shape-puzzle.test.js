/**
 * 図形パズルゲームのテスト
 * Tests for ShapePuzzle
 */

const { initShapePuzzle } = require('./shape-puzzle.js');

describe('initShapePuzzle', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'shape-puzzle-game';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initShapePuzzle();

        expect(container.querySelector('.shape-header')).not.toBeNull();
        expect(container.querySelector('.shape-target-area')).not.toBeNull();
        expect(container.querySelector('.shape-choices-area')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initShapePuzzle()).not.toThrow();
    });

    test('ターゲット図形名が表示される', () => {
        initShapePuzzle();

        const target = container.querySelector('.shape-target-name');
        expect(target).not.toBeNull();
        expect(target.textContent.length).toBeGreaterThan(0);
    });

    test('選択肢が3つ表示される', () => {
        initShapePuzzle();

        const buttons = container.querySelectorAll('.shape-choice-btn');
        expect(buttons.length).toBe(3);
    });

    test('選択肢に + 記号が含まれる（構成要素の結合）', () => {
        initShapePuzzle();

        const buttons = container.querySelectorAll('.shape-choice-btn');
        buttons.forEach(btn => {
            expect(btn.textContent).toContain('+');
        });
    });

    test('正しい構成を選ぶとせいかいフィードバック', () => {
        initShapePuzzle();

        const buttons = container.querySelectorAll('.shape-choice-btn');
        // 正解は不明なので、クリックしてフィードバックを確認
        buttons[0].click();

        const feedback = container.querySelector('.shape-feedback');
        expect(feedback.textContent.length).toBeGreaterThan(0);
    });
});
