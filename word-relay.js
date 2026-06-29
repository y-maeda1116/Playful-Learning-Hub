/**
 * ことばリレー（しりとり）ゲーム
 * Word Relay (Shiritori) Game for ages 5-8
 */

function initWordRelayGame() {
    const gameContainer = document.getElementById('word-relay-game');
    if (!gameContainer) return;

    let targetChar = null;
    let chain = [];
    let score = 0;
    let difficulty = 'easy';
    let gameActive = true;
    let isPlayerTurn = false;

    const wordDatabase = {
        easy: [
            { word: 'りんご', emoji: '🍎' },
            { word: 'ごりら', emoji: '🦍' },
            { word: 'らっぱ', emoji: '🎺' },
            { word: 'ぱんだ', emoji: '🐼' },
            { word: 'だるま', emoji: '🎎' },
            { word: 'まりも', emoji: '🌿' },
            { word: 'もり', emoji: '🌲' },
            { word: 'りす', emoji: '🐿️' },
            { word: 'すいか', emoji: '🍉' },
            { word: 'からす', emoji: '🐦‍⬛' },
            { word: 'すずめ', emoji: '🐦' },
            { word: 'めがね', emoji: '👓' },
            { word: 'ねこ', emoji: '🐱' },
            { word: 'こま', emoji: '🪀' },
            { word: 'まだ', emoji: '🦓' },
            { word: 'だちょう', emoji: '🦩' },
            { word: 'うみ', emoji: '🌊' },
            { word: 'みみず', emoji: '🪱' },
            { word: 'ずつき', emoji: '😤' },
            { word: 'きつね', emoji: '🦊' },
            { word: 'ねずみ', emoji: '🐭' },
            { word: 'みかん', emoji: '🍊' },
            { word: 'ん', emoji: '❌' },
            { word: 'たぬき', emoji: '🦝' },
            { word: 'きりん', emoji: '🦒' },
            { word: 'うし', emoji: '🐄' },
            { word: 'しか', emoji: '🦌' },
            { word: 'かえる', emoji: '🐸' },
            { word: 'るす', emoji: '🏠' },
            { word: 'すな', emoji: '🏖️' },
            { word: 'なし', emoji: '🍐' },
            { word: 'しまうま', emoji: '🦓' },
            { word: 'まつ', emoji: '🌲' },
            { word: 'つき', emoji: '🌙' },
            { word: 'きのこ', emoji: '🍄' },
            { word: 'こまつ', emoji: '🌲' },
            { word: 'つる', emoji: '🦢' },
            { word: 'るり', emoji: '💎' },
            { word: 'りか', emoji: '🔬' },
            { word: 'かさ', emoji: '☂️' },
            { word: 'さかな', emoji: '🐟' },
            { word: 'なす', emoji: '🍆' },
            { word: 'すし', emoji: '🍣' },
            { word: 'しまう', emoji: '📦' },
            { word: 'うま', emoji: '🐴' },
            { word: 'まくら', emoji: '🛏️' },
            { word: 'らくだ', emoji: '🐪' },
            { word: 'だこ', emoji: '🐙' },
            { word: 'こま', emoji: '🪀' },
            { word: 'まち', emoji: '🏘️' },
        ],
        medium: [
            { word: 'いぬ', emoji: '🐕' },
            { word: 'ぬいぐるみ', emoji: '🧸' },
            { word: 'みらい', emoji: '🚀' },
            { word: 'いちご', emoji: '🍓' },
            { word: 'ごま', emoji: '🫘' },
            { word: 'まんねんひつ', emoji: '🖊️' },
            { word: 'つみき', emoji: '🧱' },
            { word: 'きって', emoji: '📮' },
            { word: 'てぶくろ', emoji: '🧤' },
            { word: 'ろうそく', emoji: '🕯️' },
            { word: 'くるま', emoji: '🚗' },
            { word: 'まほうつかい', emoji: '🧙' },
            { word: 'いかり', emoji: '⚓' },
            { word: 'りゆう', emoji: '📋' },
            { word: 'うんどう', emoji: '🏃' },
            { word: 'うどん', emoji: '🍜' },
            { word: 'どんぐり', emoji: '🌰' },
            { word: 'りんご', emoji: '🍎' },
            { word: 'ごはん', emoji: '🍚' },
            { word: 'はな', emoji: '🌸' },
            { word: 'なまけもの', emoji: '🦥' },
            { word: 'ものおき', emoji: '🏪' },
            { word: 'きおく', emoji: '🧠' },
            { word: 'くも', emoji: '☁️' },
            { word: 'もち', emoji: '🍡' },
            { word: 'ちきゅう', emoji: '🌍' },
            { word: 'うみがめ', emoji: '🐢' },
            { word: 'めがね', emoji: '👓' },
            { word: 'ねっし', emoji: '🏜️' },
            { word: 'しかく', emoji: '🔷' },
        ],
    };

    function getLastChar(word) {
        return word.charAt(word.length - 1);
    }

    function getFirstChar(word) {
        return word.charAt(0);
    }

    function findWordsStartingWith(char, difficultyLevel) {
        const words = wordDatabase[difficultyLevel] || wordDatabase.easy;
        return words.filter(w => getFirstChar(w.word) === char && getLastChar(w.word) !== 'ん');
    }

    function buildUI() {
        gameContainer.textContent = '';

        const header = document.createElement('div');
        header.className = 'word-relay-header';

        const title = document.createElement('h2');
        title.textContent = 'ことばリレー';

        const scoreEl = document.createElement('span');
        scoreEl.className = 'word-relay-score';
        scoreEl.textContent = 'チェーン: 0';
        scoreEl.id = 'word-relay-score-display';

        header.appendChild(title);
        header.appendChild(scoreEl);
        gameContainer.appendChild(header);

        const chainArea = document.createElement('div');
        chainArea.className = 'word-relay-chain';
        chainArea.id = 'word-relay-chain';
        gameContainer.appendChild(chainArea);

        const targetArea = document.createElement('div');
        targetArea.className = 'word-relay-target';
        targetArea.id = 'word-relay-target';
        gameContainer.appendChild(targetArea);

        const choicesArea = document.createElement('div');
        choicesArea.className = 'word-relay-choices';
        choicesArea.id = 'word-relay-choices';
        gameContainer.appendChild(choicesArea);

        const feedbackEl = document.createElement('p');
        feedbackEl.className = 'word-relay-feedback';
        feedbackEl.id = 'word-relay-feedback';
        gameContainer.appendChild(feedbackEl);
    }

    function updateChainDisplay() {
        const chainArea = document.getElementById('word-relay-chain');
        chainArea.textContent = '';

        const displayChain = chain.slice(-6);
        displayChain.forEach((entry, i) => {
            const wordEl = document.createElement('span');
            wordEl.className = 'word-relay-word';
            wordEl.textContent = `${entry.emoji} ${entry.word}`;
            chainArea.appendChild(wordEl);

            if (i < displayChain.length - 1) {
                const arrow = document.createElement('span');
                arrow.className = 'word-relay-arrow';
                arrow.textContent = '→';
                chainArea.appendChild(arrow);
            }
        });
    }

    function computerTurn() {
        const feedbackEl = document.getElementById('word-relay-feedback');
        feedbackEl.textContent = '';

        let available;
        if (targetChar) {
            available = findWordsStartingWith(targetChar, difficulty);
        } else {
            const words = wordDatabase[difficulty] || wordDatabase.easy;
            available = words.filter(w => getLastChar(w.word) !== 'ん');
        }

        if (available.length === 0) {
            startNewGame();
            return;
        }

        const chosen = available[Math.floor(Math.random() * available.length)];
        chain.push({ word: chosen.word, emoji: chosen.emoji, player: 'computer' });
        targetChar = getLastChar(chosen.word);
        updateChainDisplay();

        const targetArea = document.getElementById('word-relay-target');
        targetArea.textContent = '';

        const nextCharDisplay = document.createElement('div');
        nextCharDisplay.className = 'word-relay-next-char';
        nextCharDisplay.textContent = `つぎは「${targetChar}」からはじまることば！`;
        targetArea.appendChild(nextCharDisplay);

        playerTurn();
    }

    function playerTurn() {
        isPlayerTurn = true;
        const words = wordDatabase[difficulty] || wordDatabase.easy;
        const validWords = words.filter(w => getFirstChar(w.word) === targetChar);

        let choices;
        if (validWords.length >= 4) {
            choices = validWords.sort(() => Math.random() - 0.5).slice(0, 4);
        } else {
            const allWords = words.filter(w => getFirstChar(w.word) !== targetChar);
            const distractors = allWords.sort(() => Math.random() - 0.5)
                .slice(0, 4 - validWords.length);
            choices = [...validWords, ...distractors].sort(() => Math.random() - 0.5);
        }

        const choicesArea = document.getElementById('word-relay-choices');
        choicesArea.textContent = '';
        choices.forEach(entry => {
            const btn = document.createElement('button');
            btn.className = 'word-relay-choice-btn';
            btn.textContent = `${entry.emoji} ${entry.word}`;
            btn.addEventListener('click', () => handlePlayerChoice(entry, btn));
            choicesArea.appendChild(btn);
        });
    }

    function handlePlayerChoice(entry, buttonElement) {
        if (!gameActive || !isPlayerTurn) return;
        isPlayerTurn = false;

        const feedbackEl = document.getElementById('word-relay-feedback');
        const firstChar = getFirstChar(entry.word);
        const lastChar = getLastChar(entry.word);

        if (firstChar !== targetChar) {
            buttonElement.classList.add('incorrect');
            feedbackEl.textContent = `「${targetChar}」からはじまることばを選んでね 💪`;
            feedbackEl.style.color = '#c62828';
            setTimeout(() => {
                if (gameActive) playerTurn();
            }, 1500);
            return;
        }

        chain.push({ word: entry.word, emoji: entry.emoji, player: 'player' });
        score++;
        updateChainDisplay();

        const scoreEl = document.getElementById('word-relay-score-display');
        scoreEl.textContent = `チェーン: ${score}`;

        if (lastChar === 'ん') {
            feedbackEl.textContent = '「ん」でおわり！ チェーンきりかえ 🔄';
            feedbackEl.style.color = '#1565c0';
            chain = [];
            targetChar = null;
            setTimeout(() => {
                if (gameActive) computerTurn();
            }, 2000);
            return;
        }

        buttonElement.classList.add('correct');
        feedbackEl.textContent = 'つぎへ！ 🎉';
        feedbackEl.style.color = '#2e7d32';

        if (score > 0 && score % 8 === 0 && difficulty === 'easy') {
            difficulty = 'medium';
            feedbackEl.textContent = 'レベルアップ！ 🎊';
        }

        targetChar = lastChar;

        setTimeout(() => {
            if (gameActive) computerTurn();
        }, 1000);
    }

    function startNewGame() {
        chain = [];
        score = 0;
        targetChar = null;
        difficulty = 'easy';
        const scoreEl = document.getElementById('word-relay-score-display');
        scoreEl.textContent = 'チェーン: 0';
        computerTurn();
    }

    buildUI();
    startNewGame();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initWordRelayGame);
}

if (typeof module !== 'undefined') {
    module.exports = { initWordRelayGame };
}
