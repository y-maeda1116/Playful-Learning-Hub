/**
 * せいぶつクイズ（生物クイズ）のテスト
 * Tests for BiologyQuiz
 */

const { initBiologyQuiz } = require('./biology-quiz.js');

describe('initBiologyQuiz', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'biology-quiz';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.restoreAllMocks();
        delete window.AudioManager;
    });

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initBiologyQuiz();

        expect(container.querySelector('.biology-header')).not.toBeNull();
        expect(container.querySelector('.biology-creature')).not.toBeNull();
        expect(container.querySelector('.biology-choices')).not.toBeNull();
        expect(container.querySelector('.biology-feedback')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initBiologyQuiz()).not.toThrow();
    });

    test('問題文と生き物が表示される', () => {
        initBiologyQuiz();

        const question = container.querySelector('#biology-question');
        const creature = container.querySelector('#biology-creature');
        expect(question.textContent).toContain('なーんだ');
        expect(creature.textContent.length).toBeGreaterThan(0);
    });

    test('選択肢が4つ表示される', () => {
        initBiologyQuiz();

        const choices = container.querySelectorAll('.biology-choice-btn');
        expect(choices.length).toBe(4);
    });

    test('正解を選ぶと「せいかい」・celebrate・スコア増加', () => {
        // 出題を creatures[0]=いぬ に固定
        const randomCalls = [0];
        let callIndex = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => randomCalls[callIndex++] ?? 0.5);

        initBiologyQuiz();

        expect(container.querySelector('#biology-creature').textContent).toBe('🐶');

        const correctBtn = Array.from(container.querySelectorAll('.biology-choice-btn'))
            .find(btn => btn.dataset.name === 'いぬ');
        correctBtn.click();

        const feedback = container.querySelector('#biology-feedback');
        expect(feedback.textContent).toContain('せいかい');
        expect(feedback.textContent).toContain('いぬ');
        expect(correctBtn.classList.contains('correct')).toBe(true);
        expect(container.querySelector('#biology-creature').classList.contains('celebrate')).toBe(true);
        expect(container.querySelector('#biology-score-display').textContent).toContain('1');
    });

    test('動物の正解時は鳴き声が表示される', () => {
        const randomCalls = [0]; // いぬ
        let callIndex = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => randomCalls[callIndex++] ?? 0.5);

        initBiologyQuiz();

        const correctBtn = Array.from(container.querySelectorAll('.biology-choice-btn'))
            .find(btn => btn.dataset.name === 'いぬ');
        correctBtn.click();

        expect(container.querySelector('#biology-feedback').textContent).toContain('ワンワン');
    });

    test('不正解を選ぶとリトライフィードバック・不正解クラス', () => {
        const randomCalls = [0]; // 出題: いぬ
        let callIndex = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => randomCalls[callIndex++] ?? 0.5);

        initBiologyQuiz();

        const wrongBtn = Array.from(container.querySelectorAll('.biology-choice-btn'))
            .find(btn => btn.dataset.name !== 'いぬ');
        wrongBtn.click();

        const feedback = container.querySelector('#biology-feedback');
        expect(feedback.textContent).toContain('ざんねん');
        expect(wrongBtn.classList.contains('incorrect')).toBe(true);
    });

    test('正解後に次の問題へ進む（フィードバックリセット）', () => {
        const randomCalls = [0];
        let callIndex = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => randomCalls[callIndex++] ?? 0.5);
        vi.useFakeTimers();

        initBiologyQuiz();

        const correctBtn = Array.from(container.querySelectorAll('.biology-choice-btn'))
            .find(btn => btn.dataset.name === 'いぬ');
        correctBtn.click();

        vi.advanceTimersByTime(2000);

        expect(container.querySelector('#biology-score-display').textContent).toContain('1');
        expect(container.querySelector('#biology-feedback').textContent).toBe('');
        expect(container.querySelector('#biology-creature').classList.contains('celebrate')).toBe(false);

        vi.useRealTimers();
    });

    test('AudioManager利用可能時、正解でcelebration音が鳴る', () => {
        const playFeedbackSound = vi.fn();
        window.AudioManager = function () {
            return { playFeedbackSound, audioContext: null };
        };
        const randomCalls = [0];
        let callIndex = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => randomCalls[callIndex++] ?? 0.5);

        initBiologyQuiz();

        const correctBtn = Array.from(container.querySelectorAll('.biology-choice-btn'))
            .find(btn => btn.dataset.name === 'いぬ');
        correctBtn.click();

        expect(playFeedbackSound).toHaveBeenCalledWith('celebration');
    });

    test('回答後はロックされ、連続クリックで二重採点されない', () => {
        const randomCalls = [0];
        let callIndex = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => randomCalls[callIndex++] ?? 0.5);
        vi.useFakeTimers();

        initBiologyQuiz();

        const correctBtn = Array.from(container.querySelectorAll('.biology-choice-btn'))
            .find(btn => btn.dataset.name === 'いぬ');
        correctBtn.click();
        correctBtn.click();

        expect(container.querySelector('#biology-score-display').textContent).toContain('1');

        vi.useRealTimers();
    });

    test('AudioManager生成失敗時もゲームは動作する', () => {
        window.AudioManager = function () { throw new Error('init failed'); };
        const randomCalls = [0];
        let callIndex = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => randomCalls[callIndex++] ?? 0.5);

        expect(() => initBiologyQuiz()).not.toThrow();
        expect(container.querySelector('.biology-creature')).not.toBeNull();
    });
});
