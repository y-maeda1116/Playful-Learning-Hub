/**
 * 文字書き練習機能のテスト
 * Tests for WritingPracticeGame
 */

const { WritingPracticeGame } = require('./writing-practice.js');

// jsdom は canvas をサポートしていないため getContext をモック
HTMLCanvasElement.prototype.getContext = function () {
    return {
        lineCap: '',
        lineJoin: '',
        lineWidth: 0,
        strokeStyle: '',
        fillStyle: '',
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        setLineDash: vi.fn(),
    };
};

describe('WritingPracticeGame', () => {
    let container;
    let practice;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (practice) {
            practice.destroy();
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('初期化', () => {
        test('デフォルト設定でインスタンスが作成される', () => {
            practice = new WritingPracticeGame(container);

            expect(practice.container).toBe(container);
            expect(practice.currentCharacter).toBeNull();
            expect(practice.isDrawing).toBe(false);
            expect(practice.strokePaths).toEqual([]);
            expect(practice.currentStroke).toEqual([]);
            expect(practice.completedStrokes).toBe(0);
        });

        test('カスタム設定が反映される', () => {
            practice = new WritingPracticeGame(container, {
                canvasSize: 400,
                strokeWidth: 10,
                strokeColor: '#ff0000',
                tolerance: 50,
            });

            expect(practice.options.canvasSize).toBe(400);
            expect(practice.options.strokeWidth).toBe(10);
            expect(practice.options.strokeColor).toBe('#ff0000');
            expect(practice.options.tolerance).toBe(50);
        });

        test('Canvas要素が作成される', () => {
            practice = new WritingPracticeGame(container);

            expect(practice.canvas).toBeDefined();
            expect(practice.ctx).toBeDefined();
        });

        test('UIコンテナが作成される', () => {
            practice = new WritingPracticeGame(container);

            const practiceEl = container.querySelector('.writing-practice-container');
            expect(practiceEl).not.toBeNull();
        });
    });

    describe('練習開始', () => {
        beforeEach(() => {
            practice = new WritingPracticeGame(container);
        });

        test('文字が設定される', () => {
            const character = {
                id: 'あ',
                type: 'hiragana',
                romaji: 'a',
                strokeOrder: {
                    strokes: [
                        'M 150 30 C 150 30 150 90 150 90',
                    ],
                },
            };

            practice.startPractice(character);

            expect(practice.currentCharacter).toBe(character);
        });
    });

    describe('距離計算', () => {
        beforeEach(() => {
            practice = new WritingPracticeGame(container);
        });

        test('同じ点の距離は0', () => {
            expect(practice.calculateDistance({ x: 10, y: 10 }, { x: 10, y: 10 })).toBe(0);
        });

        test('水平距離が正しく計算される', () => {
            expect(practice.calculateDistance({ x: 0, y: 0 }, { x: 30, y: 0 })).toBe(30);
        });

        test('垂直距離が正しく計算される', () => {
            expect(practice.calculateDistance({ x: 0, y: 0 }, { x: 0, y: 40 })).toBe(40);
        });

        test('斜め距離が正しく計算される', () => {
            const dist = practice.calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 });

            expect(dist).toBe(5);
        });
    });

    describe('ストロークパス解析', () => {
        beforeEach(() => {
            practice = new WritingPracticeGame(container);
        });

        test('SVGパスコマンドが正しく解析される', () => {
            const path = 'M 10 20 L 30 40';
            const points = practice.parseStrokePath(path);

            expect(points).toBeDefined();
            expect(points.length).toBeGreaterThan(0);
        });

        test('空のパスは空配列を返す', () => {
            const points = practice.parseStrokePath('');

            expect(points).toEqual([]);
        });
    });

    describe('キャンバスクリア', () => {
        beforeEach(() => {
            practice = new WritingPracticeGame(container);
        });

        test('クリアでストロークデータがリセットされる', () => {
            practice.strokePaths = [[{ x: 10, y: 10 }]];
            practice.completedStrokes = 3;

            practice.clearCanvas();

            expect(practice.strokePaths).toEqual([]);
            expect(practice.completedStrokes).toBe(0);
        });
    });

    describe('練習結果', () => {
        beforeEach(() => {
            practice = new WritingPracticeGame(container);
        });

        test('結果オブジェクトが正しく返される', () => {
            practice.currentCharacter = { id: 'あ', romaji: 'a' };
            practice.completedStrokes = 3;
            practice.guideStrokes = [{}, {}, {}];

            const results = practice.getPracticeResults();

            expect(results).toBeDefined();
            expect(results.character.id).toBe('あ');
            expect(results.completedStrokes).toBe(3);
            expect(results.totalStrokes).toBe(3);
        });
    });

    describe('オプション', () => {
        test('showStrokeOrder デフォルトはtrue', () => {
            practice = new WritingPracticeGame(container);

            expect(practice.options.showStrokeOrder).toBe(true);
        });

        test('showStrokeOrder false に設定できる', () => {
            practice = new WritingPracticeGame(container, { showStrokeOrder: false });

            expect(practice.options.showStrokeOrder).toBe(false);
        });

        test('デフォルト色が正しく設定される', () => {
            practice = new WritingPracticeGame(container);

            expect(practice.options.strokeColor).toBe('#2c3e50');
            expect(practice.options.guideColor).toBe('#bdc3c7');
            expect(practice.options.correctColor).toBe('#27ae60');
            expect(practice.options.incorrectColor).toBe('#e74c3c');
        });
    });

    describe('破棄', () => {
        test('destroy が正常に完了する', () => {
            practice = new WritingPracticeGame(container);

            expect(() => practice.destroy()).not.toThrow();
        });
    });
});
