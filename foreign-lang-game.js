/**
 * えいごのことば（外国語の単語ゲーム）
 * Foreign Language Word Game for ages 11-12
 *
 * 絵文字を見て英単語を当てるクイズ。正解時に Web Speech API で発音し、
 * 単語帳（localStorage）に記録。単語帳の単語をタップすると再び発音する。
 */

function initForeignLangGame() {
    const gameContainer = document.getElementById('foreign-lang-game');
    if (!gameContainer) return;

    const words = [
        { ja: 'りんご', emoji: '🍎', en: 'apple' },
        { ja: 'いぬ', emoji: '🐶', en: 'dog' },
        { ja: 'くるま', emoji: '🚗', en: 'car' },
        { ja: 'はな', emoji: '🌸', en: 'flower' },
        { ja: 'ほし', emoji: '⭐', en: 'star' },
        { ja: 'みず', emoji: '💧', en: 'water' },
    ];

    const STORAGE_KEY = 'foreign-lang-wordbook';
    let currentWord = null;
    let waitingForAnswer = false;

    function loadWordbook() {
        try {
            const data = window.localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveWordbook(book) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
        } catch (e) {
            // 保存失敗は無視（プライベートモード等）
        }
    }

    function addToWordbook(word) {
        const book = loadWordbook();
        if (!book.some(w => w.en === word.en)) {
            book.push(word);
            saveWordbook(book);
        }
    }

    function speak(text) {
        if (typeof window !== 'undefined' && window.speechSynthesis &&
            typeof window.SpeechSynthesisUtterance === 'function') {
            try {
                const utter = new window.SpeechSynthesisUtterance(text);
                utter.lang = 'en-US';
                window.speechSynthesis.speak(utter);
            } catch (e) {
                // 音声失敗は無視
            }
        }
    }

    function shuffle(array) {
        const arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    function buildUI() {
        gameContainer.textContent = '';

        const header = document.createElement('div');
        header.className = 'foreign-header';
        const title = document.createElement('h2');
        title.textContent = 'えいごのことば';
        header.appendChild(title);
        gameContainer.appendChild(header);

        const questionEl = document.createElement('p');
        questionEl.className = 'foreign-question';
        questionEl.id = 'foreign-question';
        questionEl.textContent = 'これをえいごでいうと？';
        gameContainer.appendChild(questionEl);

        const picture = document.createElement('div');
        picture.className = 'foreign-picture';
        picture.id = 'foreign-picture';
        gameContainer.appendChild(picture);

        const choices = document.createElement('div');
        choices.className = 'foreign-choices';
        choices.id = 'foreign-choices';
        gameContainer.appendChild(choices);

        const feedback = document.createElement('p');
        feedback.className = 'foreign-feedback';
        feedback.id = 'foreign-feedback';
        gameContainer.appendChild(feedback);

        const bookTitle = document.createElement('h3');
        bookTitle.className = 'foreign-book-title';
        bookTitle.textContent = '単語帳（おぼえたことば）';
        gameContainer.appendChild(bookTitle);

        const bookArea = document.createElement('div');
        bookArea.className = 'foreign-wordbook';
        bookArea.id = 'foreign-wordbook';
        gameContainer.appendChild(bookArea);
    }

    function startRound() {
        waitingForAnswer = true;

        const feedback = document.getElementById('foreign-feedback');
        feedback.textContent = '';
        feedback.className = 'foreign-feedback';

        const choices = document.getElementById('foreign-choices');
        choices.textContent = '';

        currentWord = words[Math.floor(Math.random() * words.length)];
        document.getElementById('foreign-picture').textContent = currentWord.emoji;

        const wrongs = shuffle(words.filter(w => w.en !== currentWord.en)).slice(0, 3);
        const options = shuffle([currentWord, ...wrongs]);

        options.forEach(w => {
            const btn = document.createElement('button');
            btn.className = 'foreign-choice-btn';
            btn.textContent = w.en;
            btn.dataset.en = w.en;
            btn.addEventListener('click', () => checkAnswer(w.en, btn));
            choices.appendChild(btn);
        });
    }

    function checkAnswer(selected, btn) {
        if (!waitingForAnswer) return;
        waitingForAnswer = false;

        const feedback = document.getElementById('foreign-feedback');
        const isCorrect = selected === currentWord.en;

        if (isCorrect) {
            btn.classList.add('correct');
            feedback.textContent = 'せいかい！ ' + currentWord.en + '（' + currentWord.ja + '）';
            feedback.className = 'foreign-feedback correct';
            speak(currentWord.en);
            addToWordbook(currentWord);
            renderWordbook();
        } else {
            btn.classList.add('incorrect');
            feedback.textContent = 'ざんねん... こたえは ' + currentWord.en + ' だよ';
            feedback.className = 'foreign-feedback incorrect';
        }

        setTimeout(startRound, 1800);
    }

    function renderWordbook() {
        const area = document.getElementById('foreign-wordbook');
        area.textContent = '';

        const book = loadWordbook();
        if (book.length === 0) {
            area.textContent = 'まだありません。せいかいすると ここに でるよ！';
            return;
        }
        book.forEach(w => {
            const chip = document.createElement('button');
            chip.className = 'foreign-word-chip';
            chip.textContent = w.emoji + ' ' + w.en;
            chip.addEventListener('click', () => speak(w.en));
            area.appendChild(chip);
        });
    }

    buildUI();
    startRound();
    renderWordbook();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initForeignLangGame);
}

if (typeof module !== 'undefined') {
    module.exports = { initForeignLangGame };
}
