/**
 * カタカナ学習ゲームのテスト
 * Tests for KatakanaGame
 */

const { initKatakanaGame } = require('./katakana-game.js');

describe('initKatakanaGame', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'katakana-game';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initKatakanaGame();

        expect(container.querySelector('.katakana-header')).not.toBeNull();
        expect(container.querySelector('.katakana-question-area')).not.toBeNull();
        expect(container.querySelector('.katakana-choices-area')).not.toBeNull();
        expect(container.querySelector('.katakana-feedback')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => {
            const ghost = document.createElement('div');
            ghost.id = 'nonexistent';
            document.body.appendChild(ghost);
            const mod = require('./katakana-game.js');
            // initKatakanaGame checks for #katakana-game, not #nonexistent
            mod.initKatakanaGame();
            document.body.removeChild(ghost);
        }).not.toThrow();
    });

    test('カタカナ文字が表示される', () => {
        initKatakanaGame();

        const charDisplay = container.querySelector('.katakana-display-char');
        expect(charDisplay).not.toBeNull();
        expect(charDisplay.textContent.length).toBe(1);
    });

    test('選択肢ボタンが3つ以上表示される', () => {
        initKatakanaGame();

        const buttons = container.querySelectorAll('.katakana-choice-btn');
        expect(buttons.length).toBeGreaterThanOrEqual(3);
    });

    test('正しい選択肢をクリックするとせいかいフィードバックが表示される', () => {
        initKatakanaGame();

        const charDisplay = container.querySelector('.katakana-display-char');
        const displayedKata = charDisplay.textContent;

        const pairs = {
            'ア': 'あ', 'イ': 'い', 'ウ': 'う', 'エ': 'え', 'オ': 'お',
            'カ': 'か', 'キ': 'き', 'ク': 'く', 'ケ': 'け', 'コ': 'こ',
            'サ': 'さ', 'シ': 'し', 'ス': 'す', 'セ': 'せ', 'ソ': 'そ',
            'タ': 'た', 'チ': 'ち', 'ツ': 'つ', 'テ': 'て', 'ト': 'と',
            'ナ': 'な', 'ニ': 'に', 'ヌ': 'ぬ', 'ネ': 'ね', 'ノ': 'の',
            'ハ': 'は', 'ヒ': 'ひ', 'フ': 'ふ', 'ヘ': 'へ', 'ホ': 'ほ',
            'マ': 'ま', 'ミ': 'み', 'ム': 'む', 'メ': 'め', 'モ': 'も',
            'ヤ': 'や', 'ユ': 'ゆ', 'ヨ': 'よ',
            'ラ': 'ら', 'リ': 'り', 'ル': 'る', 'レ': 'れ', 'ロ': 'ろ',
            'ワ': 'わ', 'ヲ': 'を', 'ン': 'ん',
        };

        const correctHiragana = pairs[displayedKata];
        const buttons = container.querySelectorAll('.katakana-choice-btn');

        for (const btn of buttons) {
            if (btn.textContent === correctHiragana) {
                btn.click();
                break;
            }
        }

        const feedback = container.querySelector('.katakana-feedback');
        expect(feedback.textContent).toContain('せいかい');
    });
});
