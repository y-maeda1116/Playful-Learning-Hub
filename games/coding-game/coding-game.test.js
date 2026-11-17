/**
 * プログラミングあそび（プログラミング基礎ゲーム）のテスト
 * Tests for CodingGame
 */

const { initCodingGame } = require('./coding-game.js');

describe('initCodingGame', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'coding-game';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.useRealTimers();
    });

    function playerCellIndex() {
        const cells = container.querySelectorAll('.coding-cell');
        const playerCell = container.querySelector('.coding-cell.player');
        return Array.from(cells).indexOf(playerCell);
    }

    test('コンテナが存在する場合、UIが作成される', () => {
        initCodingGame();

        expect(container.querySelector('.coding-grid')).not.toBeNull();
        expect(container.querySelector('#coding-palette')).not.toBeNull();
        expect(container.querySelector('#coding-program')).not.toBeNull();
        expect(container.querySelector('#coding-run-btn')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initCodingGame()).not.toThrow();
    });

    test('パレットに3つのブロックボタンが表示される', () => {
        initCodingGame();

        expect(container.querySelectorAll('.coding-block-btn').length).toBe(3);
    });

    test('初期はステージ1・キャラとゴールが表示される', () => {
        initCodingGame();

        expect(container.querySelector('#coding-stage').textContent).toContain('ステージ 1');
        expect(container.querySelector('.coding-cell.player').textContent).toBe('🐱');
        expect(container.querySelector('.coding-cell.goal').textContent).toBe('🎯');
    });

    test('ブロックを追加するとプログラムに並ぶ', () => {
        initCodingGame();

        container.querySelector('[data-type="forward"]').click();
        container.querySelector('[data-type="right"]').click();

        const chips = container.querySelectorAll('.coding-chip');
        expect(chips.length).toBe(2);
        expect(chips[0].textContent).toContain('まえへ');
        expect(chips[1].textContent).toContain('みぎ');
    });

    test('「まえへ」を実行するとキャラが1マス進む', () => {
        vi.useFakeTimers();
        initCodingGame();

        // ステージ1: start {x:0,y:4,dir:1(right)} → forward → x=1,y=4 → index=4*5+1=21
        container.querySelector('[data-type="forward"]').click();
        container.querySelector('#coding-run-btn').click();
        vi.advanceTimersByTime(600);

        expect(playerCellIndex()).toBe(21);
    });

    test('ステージ1をクリアするとステージ2へ進む', () => {
        vi.useFakeTimers();
        initCodingGame();

        // ステージ1: start {0,4,dir:right}, goal {4,4}. 右へ4回進む
        for (let i = 0; i < 4; i++) {
            container.querySelector('[data-type="forward"]').click();
        }
        container.querySelector('#coding-run-btn').click();
        vi.advanceTimersByTime(2500); // 4ステップ + 余裕

        expect(container.querySelector('#coding-message').textContent).toContain('クリア');
        // 1.5秒後に次ステージ
        vi.advanceTimersByTime(2000);
        expect(container.querySelector('#coding-stage').textContent).toContain('ステージ 2');
    });

    test('ゴールに届かないと失敗メッセージ', () => {
        vi.useFakeTimers();
        initCodingGame();

        container.querySelector('[data-type="right"]').click(); // 向きだけ変える
        container.querySelector('#coding-run-btn').click();
        vi.advanceTimersByTime(1100);

        expect(container.querySelector('#coding-message').textContent).toContain('つかなかった');
    });

    test('プログラム解除でブロックが消える', () => {
        initCodingGame();
        container.querySelector('[data-type="forward"]').click();
        expect(container.querySelectorAll('.coding-chip').length).toBe(1);

        container.querySelector('.coding-clear-btn').click();
        expect(container.querySelectorAll('.coding-chip').length).toBe(0);
    });
});
