/**
 * かがくじっけん（化学実験シミュレーション）のテスト
 * Tests for ChemistrySim
 */

const { initChemistrySim } = require('./chemistry-sim.js');

describe('initChemistrySim', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'chemistry-sim';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    function clickChem(id) {
        const btn = container.querySelector('.chemistry-chem-btn[data-id="' + id + '"]');
        btn.click();
    }

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initChemistrySim();

        expect(container.querySelector('.chemistry-beaker')).not.toBeNull();
        expect(container.querySelector('.chemistry-shelf')).not.toBeNull();
        expect(container.querySelector('#chemistry-mix-btn')).not.toBeNull();
        expect(container.querySelector('#chemistry-result')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initChemistrySim()).not.toThrow();
    });

    test('薬品ボタンが4つ表示される', () => {
        initChemistrySim();

        expect(container.querySelectorAll('.chemistry-chem-btn').length).toBe(4);
    });

    test('まぜるボタンは初期状態でdisabled', () => {
        initChemistrySim();

        expect(container.querySelector('#chemistry-mix-btn').disabled).toBe(true);
    });

    test('薬品を1つ選ぶとliquidに表示される', () => {
        initChemistrySim();

        clickChem('acid');

        const liquid = container.querySelector('#chemistry-liquid');
        expect(liquid.textContent).toContain('🍋');
    });

    test('2つ選ぶとまぜるボタンが有効になる', () => {
        initChemistrySim();

        clickChem('acid');
        clickChem('base');

        expect(container.querySelector('#chemistry-mix-btn').disabled).toBe(false);
    });

    test('3つ目は選べない（最大2つ）', () => {
        initChemistrySim();

        clickChem('acid');
        clickChem('base');
        clickChem('water'); // 無視される

        const selected = container.querySelectorAll('.chemistry-chem-btn.selected');
        expect(selected.length).toBe(2);
    });

    test('酸+塩基で中和反応・泡・説明が表示される', () => {
        initChemistrySim();

        clickChem('acid');
        clickChem('base');
        container.querySelector('#chemistry-mix-btn').click();

        const result = container.querySelector('#chemistry-result');
        expect(result.textContent).toContain('ちゅうわ');
        expect(result.textContent).toContain('みずとしお');
        expect(container.querySelector('#chemistry-liquid').classList.contains('bubble')).toBe(true);
    });

    test('反応しない組み合わせ（水+金属）はメッセージ表示', () => {
        initChemistrySim();

        clickChem('water');
        clickChem('metal');
        container.querySelector('#chemistry-mix-btn').click();

        const result = container.querySelector('#chemistry-result');
        expect(result.textContent).toContain('はんのうしなかった');
    });

    test('同じ薬品をもう一度クリックすると選択解除される', () => {
        initChemistrySim();

        clickChem('acid');
        expect(container.querySelectorAll('.chemistry-chem-btn.selected').length).toBe(1);
        clickChem('acid');
        expect(container.querySelectorAll('.chemistry-chem-btn.selected').length).toBe(0);
        expect(container.querySelector('#chemistry-mix-btn').disabled).toBe(true);
    });

    test('やりなおしボタンで選択がクリアされる', () => {
        initChemistrySim();

        clickChem('acid');
        clickChem('base');
        container.querySelector('.chemistry-reset-btn').click();

        expect(container.querySelectorAll('.chemistry-chem-btn.selected').length).toBe(0);
        expect(container.querySelector('#chemistry-mix-btn').disabled).toBe(true);
        expect(container.querySelector('#chemistry-result').textContent).toBe('');
    });
});
