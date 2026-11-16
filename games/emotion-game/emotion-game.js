/**
 * きもちあて（感情認識ゲーム）
 * Emotion Recognition Game (all ages)
 *
 * 表情を見て、どの感情かを当てるクイズ。
 * 音声は AudioManager の合成音フォールバック（音声アセット不要）。
 * ProgressTracker は文字学習ドメイン密結合のため使用しない（シンプルゲーム方針）。
 */

function initEmotionGame() {
    const gameContainer = document.getElementById('emotion-game');
    if (!gameContainer) return;

    const emotions = [
        { name: 'たのしい', emoji: '😀' },
        { name: 'かなしい', emoji: '😢' },
        { name: 'おこ', emoji: '😠' },
        { name: 'びっくり', emoji: '😲' },
        { name: 'ふしぎ', emoji: '🤔' },
    ];

    let currentEmotion = null;
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

    function buildUI() {
        gameContainer.textContent = '';

        const header = document.createElement('div');
        header.className = 'emotion-header';

        const title = document.createElement('h2');
        title.textContent = 'きもちあて';

        const scoreEl = document.createElement('span');
        scoreEl.className = 'emotion-score';
        scoreEl.id = 'emotion-score-display';
        scoreEl.textContent = 'スコア: 0';

        header.appendChild(title);
        header.appendChild(scoreEl);
        gameContainer.appendChild(header);

        const questionEl = document.createElement('p');
        questionEl.className = 'emotion-question';
        questionEl.id = 'emotion-question';
        questionEl.textContent = 'この きもちは なーんだ？';
        gameContainer.appendChild(questionEl);

        const faceEl = document.createElement('div');
        faceEl.className = 'emotion-face';
        faceEl.id = 'emotion-face';
        gameContainer.appendChild(faceEl);

        const choicesArea = document.createElement('div');
        choicesArea.className = 'emotion-choices';
        choicesArea.id = 'emotion-choices';
        gameContainer.appendChild(choicesArea);

        const feedbackEl = document.createElement('p');
        feedbackEl.className = 'emotion-feedback';
        feedbackEl.id = 'emotion-feedback';
        gameContainer.appendChild(feedbackEl);
    }

    function startRound() {
        waitingForAnswer = true;

        const feedbackEl = document.getElementById('emotion-feedback');
        feedbackEl.textContent = '';
        feedbackEl.className = 'emotion-feedback';

        const choicesArea = document.getElementById('emotion-choices');
        choicesArea.textContent = '';

        currentEmotion = emotions[Math.floor(Math.random() * emotions.length)];

        const faceEl = document.getElementById('emotion-face');
        faceEl.textContent = currentEmotion.emoji;

        emotions.forEach(emotion => {
            const btn = document.createElement('button');
            btn.className = 'emotion-choice-btn';
            btn.textContent = emotion.name;
            btn.dataset.name = emotion.name;
            btn.addEventListener('click', () => checkAnswer(emotion.name, btn));
            choicesArea.appendChild(btn);
        });
    }

    function checkAnswer(selectedName, buttonElement) {
        if (!waitingForAnswer) return;
        waitingForAnswer = false;

        resumeAudio();

        const feedbackEl = document.getElementById('emotion-feedback');
        const isCorrect = selectedName === currentEmotion.name;

        if (isCorrect) {
            score++;
            buttonElement.classList.add('correct');
            feedbackEl.textContent = 'せいかい！ 🎉';
            feedbackEl.className = 'emotion-feedback correct';
            if (audioManager) {
                audioManager.playFeedbackSound('correct');
            }
        } else {
            buttonElement.classList.add('incorrect');
            feedbackEl.textContent = `ざんねん... こたえは「${currentEmotion.name}」だよ 💪`;
            feedbackEl.className = 'emotion-feedback incorrect';
            if (audioManager) {
                audioManager.playFeedbackSound('incorrect');
            }
        }

        const scoreEl = document.getElementById('emotion-score-display');
        scoreEl.textContent = `スコア: ${score}`;

        setTimeout(() => startRound(), 1800);
    }

    buildUI();
    startRound();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initEmotionGame);
}

if (typeof module !== 'undefined') {
    module.exports = { initEmotionGame };
}
