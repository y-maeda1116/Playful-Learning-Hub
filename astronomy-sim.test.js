/**
 * ほしぞら観察（天体観測シミュレーション）のテスト
 * Tests for AstronomySim
 */

const { initAstronomySim, getSkyRotation, rotatePoint } = require('./astronomy-sim.js');

describe('getSkyRotation', () => {
    test('0時は0度', () => {
        expect(getSkyRotation(0)).toBe(0);
    });

    test('12時は180度', () => {
        expect(getSkyRotation(12)).toBe(180);
    });

    test('24時は360度', () => {
        expect(getSkyRotation(24)).toBe(360);
    });

    test('6時は90度', () => {
        expect(getSkyRotation(6)).toBe(90);
    });
});

describe('rotatePoint', () => {
    test('0度では同じ位置', () => {
        const p = rotatePoint(1, 0, 0);
        expect(p.x).toBeCloseTo(1);
        expect(p.y).toBeCloseTo(0);
    });

    test('90度で回転する', () => {
        const p = rotatePoint(1, 0, 90);
        expect(p.x).toBeCloseTo(0);
        expect(p.y).toBeCloseTo(1);
    });

    test('180度で反転する', () => {
        const p = rotatePoint(1, 0, 180);
        expect(p.x).toBeCloseTo(-1);
        expect(p.y).toBeCloseTo(0);
    });
});

describe('initAstronomySim', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'astronomy-sim';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('コンテナが存在する場合、UIが作成される', () => {
        initAstronomySim();

        expect(container.querySelector('#astro-canvas')).not.toBeNull();
        expect(container.querySelector('#astro-hour')).not.toBeNull();
        expect(container.querySelector('#astro-zoom-in')).not.toBeNull();
        expect(container.querySelector('#astro-zoom-out')).not.toBeNull();
        expect(container.querySelector('#astro-info')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initAstronomySim()).not.toThrow();
    });

    test('初期時刻は夜の21時', () => {
        initAstronomySim();

        expect(container.querySelector('#astro-hour-label').textContent).toContain('21');
    });

    test('スライダー変更で時刻ラベルが更新される', () => {
        initAstronomySim();

        const slider = container.querySelector('#astro-hour');
        slider.value = '5';
        slider.dispatchEvent(new Event('input', { bubbles: true }));

        expect(container.querySelector('#astro-hour-label').textContent).toContain('5');
    });

    test('初期の案内メッセージが表示される', () => {
        initAstronomySim();

        expect(container.querySelector('#astro-info').textContent).toContain('クリック');
    });
});
