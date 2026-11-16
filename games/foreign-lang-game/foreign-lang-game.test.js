/**
 * えいごのことば（外国語の単語ゲーム）のテスト
 * Tests for ForeignLangGame
 */

const { initForeignLangGame } = require('./foreign-lang-game.js');

describe('initForeignLangGame', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'foreign-lang-game';
        document.body.appendChild(container);
        const store = {};
        window.localStorage = {
            getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
            setItem: (k, v) => { store[k] = String(v); },
            removeItem: (k) => { delete store[k]; },
            clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        };
    });

    afterEach(() => {
        document.body.removeChild(container);
        delete window.localStorage;
        vi.restoreAllMocks();
        delete window.speechSynthesis;
        delete window.SpeechSynthesisUtterance;
    });

    function fixedRandom() {
        // 出題を words[0]=りんご/apple に固定（以降は0.5でシャッフルを決定論的に）
        const calls = [0];
        let i = 0;
        return vi.spyOn(Math, 'random').mockImplementation(() => calls[i++] ?? 0.5);
    }

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initForeignLangGame();

        expect(container.querySelector('.foreign-picture')).not.toBeNull();
        expect(container.querySelector('.foreign-choices')).not.toBeNull();
        expect(container.querySelector('.foreign-feedback')).not.toBeNull();
        expect(container.querySelector('.foreign-wordbook')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initForeignLangGame()).not.toThrow();
    });

    test('絵文字と選択肢4つが表示される', () => {
        fixedRandom();
        initForeignLangGame();

        expect(container.querySelector('#foreign-picture').textContent).toBe('🍎');
        expect(container.querySelectorAll('.foreign-choice-btn').length).toBe(4);
    });

    test('正解を選ぶと「せいかい」フィードバック', () => {
        fixedRandom();
        initForeignLangGame();

        const correctBtn = Array.from(container.querySelectorAll('.foreign-choice-btn'))
            .find(b => b.dataset.en === 'apple');
        correctBtn.click();

        const feedback = container.querySelector('#foreign-feedback');
        expect(feedback.textContent).toContain('せいかい');
        expect(feedback.textContent).toContain('apple');
        expect(correctBtn.classList.contains('correct')).toBe(true);
    });

    test('不正解を選ぶとリトライフィードバック・答え表示', () => {
        fixedRandom();
        initForeignLangGame();

        const wrongBtn = Array.from(container.querySelectorAll('.foreign-choice-btn'))
            .find(b => b.dataset.en !== 'apple');
        wrongBtn.click();

        const feedback = container.querySelector('#foreign-feedback');
        expect(feedback.textContent).toContain('ざんねん');
        expect(wrongBtn.classList.contains('incorrect')).toBe(true);
    });

    test('単語帳は初期状態で「まだありません」', () => {
        initForeignLangGame();

        expect(container.querySelector('#foreign-wordbook').textContent).toContain('まだありません');
    });

    test('正解すると単語帳にchipが追加される', () => {
        fixedRandom();
        initForeignLangGame();

        const correctBtn = Array.from(container.querySelectorAll('.foreign-choice-btn'))
            .find(b => b.dataset.en === 'apple');
        correctBtn.click();

        const chips = container.querySelectorAll('.foreign-word-chip');
        expect(chips.length).toBe(1);
        expect(chips[0].textContent).toContain('apple');
    });

    test('正解時にspeechSynthesis.speakが呼ばれる', () => {
        const speak = vi.fn();
        window.speechSynthesis = { speak };
        window.SpeechSynthesisUtterance = function (text) { this.text = text; };
        fixedRandom();

        initForeignLangGame();

        const correctBtn = Array.from(container.querySelectorAll('.foreign-choice-btn'))
            .find(b => b.dataset.en === 'apple');
        correctBtn.click();

        expect(speak).toHaveBeenCalledTimes(1);
    });

    test('正解後、次の問題へ進む（フィードバックリセット）', () => {
        fixedRandom();
        vi.useFakeTimers();
        initForeignLangGame();

        const correctBtn = Array.from(container.querySelectorAll('.foreign-choice-btn'))
            .find(b => b.dataset.en === 'apple');
        correctBtn.click();

        vi.advanceTimersByTime(2000);

        expect(container.querySelector('#foreign-feedback').textContent).toBe('');

        vi.useRealTimers();
    });
});
