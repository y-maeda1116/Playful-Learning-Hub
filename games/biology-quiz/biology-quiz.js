/**
 * せいぶつクイズ（生物クイズ）
 * Biology Quiz for ages 5-6
 *
 * 動物・植物の絵文字を見て、名前を当てるクイズ。
 * 正解時は鳴き声(オノマトペ)表示とアニメーション、合成音でフィードバック。
 * 音声アセットは不要（AudioManager の合成音フォールバック）。
 */

function initBiologyQuiz() {
    const gameContainer = document.getElementById('biology-quiz');
    if (!gameContainer) return;

    const creatures = [
        { name: 'いぬ', emoji: '🐶', cry: 'ワンワン！' },
        { name: 'ねこ', emoji: '🐱', cry: 'ニャー！' },
        { name: 'ぞう', emoji: '🐘', cry: 'パオーン！' },
        { name: 'うさぎ', emoji: '🐰', cry: 'ピョンピョン！' },
        { name: 'ひまわり', emoji: '🌻', cry: null },
        { name: 'さくら', emoji: '🌸', cry: null },
    ];

    let currentCreature = null;
    let score = 0;
    let waitingForAnswer = false;

    // AudioManager（利用可能なら生成。合成音が鳴るためアセット不要）
    let audioManager = null;
    if (typeof window !== 'undefined' && typeof window.AudioManager === 'function') {
        try {
            audioManager = new window.AudioManager({ volume: 0.7 });
        } catch (error) {
            audioManager = null;
        }
    }

    function resumeAudio() {
        if (audioManager && audioManager.audioContext &&
            audioManager.audioContext.state === 'suspended') {
            audioManager.audioContext.resume();
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
        header.className = 'biology-header';

        const title = document.createElement('h2');
        title.textContent = 'せいぶつクイズ';

        const scoreEl = document.createElement('span');
        scoreEl.className = 'biology-score';
        scoreEl.id = 'biology-score-display';
        scoreEl.textContent = 'スコア: 0';

        header.appendChild(title);
        header.appendChild(scoreEl);
        gameContainer.appendChild(header);

        const questionEl = document.createElement('p');
        questionEl.className = 'biology-question';
        questionEl.id = 'biology-question';
        questionEl.textContent = 'これは なーんだ？';
        gameContainer.appendChild(questionEl);

        const creatureEl = document.createElement('div');
        creatureEl.className = 'biology-creature';
        creatureEl.id = 'biology-creature';
        gameContainer.appendChild(creatureEl);

        const choicesArea = document.createElement('div');
        choicesArea.className = 'biology-choices';
        choicesArea.id = 'biology-choices';
        gameContainer.appendChild(choicesArea);

        const feedbackEl = document.createElement('p');
        feedbackEl.className = 'biology-feedback';
        feedbackEl.id = 'biology-feedback';
        gameContainer.appendChild(feedbackEl);
    }

    function startRound() {
        waitingForAnswer = true;

        const feedbackEl = document.getElementById('biology-feedback');
        feedbackEl.textContent = '';
        feedbackEl.className = 'biology-feedback';

        const creatureEl = document.getElementById('biology-creature');
        creatureEl.classList.remove('celebrate');

        const choicesArea = document.getElementById('biology-choices');
        choicesArea.textContent = '';

        currentCreature = creatures[Math.floor(Math.random() * creatures.length)];

        creatureEl.textContent = currentCreature.emoji;

        // 選択肢: 正解 + ダミー3つ（シャッフル）
        const wrongs = shuffle(creatures.filter(c => c.name !== currentCreature.name)).slice(0, 3);
        const choices = shuffle([currentCreature, ...wrongs]);

        choices.forEach(creature => {
            const btn = document.createElement('button');
            btn.className = 'biology-choice-btn';
            btn.textContent = creature.name;
            btn.dataset.name = creature.name;
            btn.addEventListener('click', () => checkAnswer(creature.name, btn));
            choicesArea.appendChild(btn);
        });
    }

    function checkAnswer(selectedName, buttonElement) {
        if (!waitingForAnswer) return;
        waitingForAnswer = false;

        resumeAudio();

        const feedbackEl = document.getElementById('biology-feedback');
        const creatureEl = document.getElementById('biology-creature');
        const isCorrect = selectedName === currentCreature.name;

        if (isCorrect) {
            score++;
            buttonElement.classList.add('correct');
            creatureEl.classList.add('celebrate');
            const cryText = currentCreature.cry ? ` ${currentCreature.cry}` : '';
            feedbackEl.textContent = `せいかい！「${currentCreature.name}」だね${cryText} 🎉`;
            feedbackEl.className = 'biology-feedback correct';
            if (audioManager) {
                audioManager.playFeedbackSound('celebration');
            }
        } else {
            buttonElement.classList.add('incorrect');
            feedbackEl.textContent = 'ざんねん... もういっかい！';
            feedbackEl.className = 'biology-feedback incorrect';
            if (audioManager) {
                audioManager.playFeedbackSound('incorrect');
            }
        }

        const scoreEl = document.getElementById('biology-score-display');
        scoreEl.textContent = `スコア: ${score}`;

        setTimeout(() => startRound(), 1800);
    }

    buildUI();
    startRound();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initBiologyQuiz);
}

if (typeof module !== 'undefined') {
    module.exports = { initBiologyQuiz };
}
