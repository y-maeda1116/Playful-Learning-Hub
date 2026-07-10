/**
 * きもちあて（感情認識ゲーム）のテスト
 * Tests for EmotionGame
 */

const { initEmotionGame } = require('./emotion-game.js');

describe('initEmotionGame', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'emotion-game';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.restoreAllMocks();
        delete window.AudioManager;
    });

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initEmotionGame();

        expect(container.querySelector('.emotion-header')).not.toBeNull();
        expect(container.querySelector('.emotion-face')).not.toBeNull();
        expect(container.querySelector('.emotion-choices')).not.toBeNull();
        expect(container.querySelector('.emotion-feedback')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initEmotionGame()).not.toThrow();
    });

    test('問題文と表情が表示される', () => {
        initEmotionGame();

        const question = container.querySelector('#emotion-question');
        const face = container.querySelector('#emotion-face');
        expect(question.textContent).toContain('きもちは');
        expect(face.textContent.length).toBeGreaterThan(0);
    });

    test('選択肢が感情の数だけ表示される', () => {
        initEmotionGame();

        const choices = container.querySelectorAll('.emotion-choice-btn');
        expect(choices.length).toBe(5);
    });

    test('正解を選ぶと「せいかい」・正解クラス・スコア増加', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0); // emotions[0] = たのしい 😀

        initEmotionGame();

        expect(container.querySelector('#emotion-face').textContent).toBe('😀');

        const correctBtn = Array.from(container.querySelectorAll('.emotion-choice-btn'))
            .find(btn => btn.textContent === 'たのしい');
        correctBtn.click();

        const feedback = container.querySelector('#emotion-feedback');
        expect(feedback.textContent).toContain('せいかい');
        expect(correctBtn.classList.contains('correct')).toBe(true);
        expect(container.querySelector('#emotion-score-display').textContent).toContain('1');
    });

    test('不正解を選ぶとリトライ・不正解クラス・答え表示', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0); // 出題: たのしい

        initEmotionGame();

        const wrongBtn = Array.from(container.querySelectorAll('.emotion-choice-btn'))
            .find(btn => btn.textContent === 'かなしい');
        wrongBtn.click();

        const feedback = container.querySelector('#emotion-feedback');
        expect(feedback.textContent).toContain('ざんねん');
        expect(feedback.textContent).toContain('たのしい');
        expect(wrongBtn.classList.contains('incorrect')).toBe(true);
    });

    test('正解後に次の問題へ進む（フィードバックリセット）', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        vi.useFakeTimers();

        initEmotionGame();

        const correctBtn = Array.from(container.querySelectorAll('.emotion-choice-btn'))
            .find(btn => btn.textContent === 'たのしい');
        correctBtn.click();

        vi.advanceTimersByTime(2000);

        expect(container.querySelector('#emotion-score-display').textContent).toContain('1');
        expect(container.querySelector('#emotion-feedback').textContent).toBe('');

        vi.useRealTimers();
    });

    test('AudioManager利用可能時、正解で正解音が鳴る', () => {
        const playFeedbackSound = vi.fn();
        window.AudioManager = function () {
            return { playFeedbackSound, audioContext: null };
        };
        vi.spyOn(Math, 'random').mockReturnValue(0);

        initEmotionGame();

        const correctBtn = Array.from(container.querySelectorAll('.emotion-choice-btn'))
            .find(btn => btn.textContent === 'たのしい');
        correctBtn.click();

        expect(playFeedbackSound).toHaveBeenCalledWith('correct');
    });

    test('AudioManager利用可能時、不正解で不正解音が鳴る', () => {
        const playFeedbackSound = vi.fn();
        window.AudioManager = function () {
            return { playFeedbackSound, audioContext: null };
        };
        vi.spyOn(Math, 'random').mockReturnValue(0);

        initEmotionGame();

        const wrongBtn = Array.from(container.querySelectorAll('.emotion-choice-btn'))
            .find(btn => btn.textContent === 'かなしい');
        wrongBtn.click();

        expect(playFeedbackSound).toHaveBeenCalledWith('incorrect');
    });

    test('回答後はロックされ、連続クリックで二重採点されない', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        vi.useFakeTimers();

        initEmotionGame();

        const correctBtn = Array.from(container.querySelectorAll('.emotion-choice-btn'))
            .find(btn => btn.textContent === 'たのしい');
        correctBtn.click();
        correctBtn.click(); // 2回目は waitingForAnswer=false で無視される

        expect(container.querySelector('#emotion-score-display').textContent).toContain('1');

        vi.useRealTimers();
    });

    test('初回回答時にAudioContextがsuspendedならresumeされる', () => {
        const resume = vi.fn();
        window.AudioManager = function () {
            return { playFeedbackSound: vi.fn(), audioContext: { state: 'suspended', resume } };
        };
        vi.spyOn(Math, 'random').mockReturnValue(0);

        initEmotionGame();

        const correctBtn = Array.from(container.querySelectorAll('.emotion-choice-btn'))
            .find(btn => btn.textContent === 'たのしい');
        correctBtn.click();

        expect(resume).toHaveBeenCalled();
    });

    test('AudioManager生成失敗時もゲームは動作する', () => {
        window.AudioManager = function () { throw new Error('init failed'); };
        vi.spyOn(Math, 'random').mockReturnValue(0);

        expect(() => initEmotionGame()).not.toThrow();
        expect(container.querySelector('.emotion-face')).not.toBeNull();
    });
});
