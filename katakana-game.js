/**
 * カタカナ学習ゲーム
 * Katakana Learning Game for ages 3-6
 */

function initKatakanaGame() {
    const gameContainer = document.getElementById('katakana-game');
    if (!gameContainer) return;

    let currentKatakana = null;
    let score = 0;
    let totalQuestions = 0;
    let difficulty = 1;
    let gameActive = true;

    const katakanaRows = {
        a:  ['ア','イ','ウ','エ','オ'],
        k:  ['カ','キ','ク','ケ','コ'],
        s:  ['サ','シ','ス','セ','ソ'],
        t:  ['タ','チ','ツ','テ','ト'],
        n:  ['ナ','ニ','ヌ','ネ','ノ'],
        h:  ['ハ','ヒ','フ','ヘ','ホ'],
        m:  ['マ','ミ','ム','メ','モ'],
        y:  ['ヤ','ユ','ヨ'],
        r:  ['ラ','リ','ル','レ','ロ'],
        w:  ['ワ','ヲ','ン'],
    };

    const hiraganaRows = {
        a:  ['あ','い','う','え','お'],
        k:  ['か','き','く','け','こ'],
        s:  ['さ','し','す','せ','そ'],
        t:  ['た','ち','つ','て','と'],
        n:  ['な','に','ぬ','ね','の'],
        h:  ['は','ひ','ふ','へ','ほ'],
        m:  ['ま','み','む','め','も'],
        y:  ['や','ゆ','よ'],
        r:  ['ら','り','る','れ','ろ'],
        w:  ['わ','を','ん'],
    };

    const rowOrder = ['a', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];

    function getActiveRows() {
        if (difficulty === 1) return ['a', 'k', 's', 't', 'n'];
        return rowOrder;
    }

    function getAllPairs() {
        const rows = getActiveRows();
        const pairs = [];
        rows.forEach(row => {
            katakanaRows[row].forEach((kata, i) => {
                pairs.push({ katakana: kata, hiragana: hiraganaRows[row][i], row });
            });
        });
        return pairs;
    }

    function buildUI() {
        gameContainer.textContent = '';

        const header = document.createElement('div');
        header.className = 'katakana-header';

        const title = document.createElement('h2');
        title.textContent = 'カタカナあそび';

        const scoreEl = document.createElement('span');
        scoreEl.className = 'katakana-score';
        scoreEl.textContent = 'スコア: 0';
        scoreEl.id = 'katakana-score-display';

        header.appendChild(title);
        header.appendChild(scoreEl);
        gameContainer.appendChild(header);

        const questionArea = document.createElement('div');
        questionArea.className = 'katakana-question-area';
        questionArea.id = 'katakana-question';
        gameContainer.appendChild(questionArea);

        const choicesArea = document.createElement('div');
        choicesArea.className = 'katakana-choices-area';
        choicesArea.id = 'katakana-choices';
        gameContainer.appendChild(choicesArea);

        const feedbackEl = document.createElement('p');
        feedbackEl.className = 'katakana-feedback';
        feedbackEl.id = 'katakana-feedback';
        gameContainer.appendChild(feedbackEl);
    }

    function setupNewRound() {
        const feedbackEl = document.getElementById('katakana-feedback');
        feedbackEl.textContent = '';

        const pairs = getAllPairs();
        const target = pairs[Math.floor(Math.random() * pairs.length)];
        currentKatakana = target;

        const questionArea = document.getElementById('katakana-question');
        questionArea.textContent = '';

        const charDisplay = document.createElement('div');
        charDisplay.className = 'katakana-display-char';
        charDisplay.textContent = target.katakana;
        questionArea.appendChild(charDisplay);

        const prompt = document.createElement('p');
        prompt.textContent = 'これとおなじひらがなは？';
        questionArea.appendChild(prompt);

        const choicesCount = difficulty === 1 ? 3 : 4;
        const wrongPairs = pairs
            .filter(p => p.katakana !== target.katakana)
            .sort(() => Math.random() - 0.5)
            .slice(0, choicesCount - 1)
            .map(p => p.hiragana);

        const choices = [target.hiragana, ...wrongPairs]
            .sort(() => Math.random() - 0.5);

        const choicesArea = document.getElementById('katakana-choices');
        choicesArea.textContent = '';
        choices.forEach(hiragana => {
            const btn = document.createElement('button');
            btn.className = 'katakana-choice-btn';
            btn.textContent = hiragana;
            btn.addEventListener('click', () => checkAnswer(hiragana, btn));
            choicesArea.appendChild(btn);
        });
    }

    function checkAnswer(selected, buttonElement) {
        if (!gameActive || !currentKatakana) return;

        totalQuestions++;
        const isCorrect = selected === currentKatakana.hiragana;
        const feedbackEl = document.getElementById('katakana-feedback');

        if (isCorrect) {
            score++;
            buttonElement.classList.add('correct');
            feedbackEl.textContent = 'せいかい！ 🌟';
            feedbackEl.style.color = '#2e7d32';

            if (score > 0 && score % 5 === 0 && difficulty < 3) {
                difficulty++;
            }
        } else {
            buttonElement.classList.add('incorrect');
            feedbackEl.textContent = `ざんねん... 「${currentKatakana.katakana}」は「${currentKatakana.hiragana}」だよ 💪`;
            feedbackEl.style.color = '#c62828';
        }

        const scoreEl = document.getElementById('katakana-score-display');
        scoreEl.textContent = `スコア: ${score}`;

        setTimeout(() => {
            if (gameActive) setupNewRound();
        }, 1500);
    }

    buildUI();
    setupNewRound();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initKatakanaGame);
}

if (typeof module !== 'undefined') {
    module.exports = { initKatakanaGame };
}
