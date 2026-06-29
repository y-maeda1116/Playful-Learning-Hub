/**
 * かずかぞえゲーム
 * Counting Game for ages 1-4
 */

function initCountingGame() {
    const gameContainer = document.getElementById('counting-game');
    if (!gameContainer) return;

    let targetCount = 0;
    let tapCount = 0;
    let currentObject = null;
    let maxNumber = 3;
    let score = 0;
    let totalQuestions = 0;
    let waitingForAnswer = false;

    const objectSets = [
        { emoji: '🍎', name: 'りんご' },
        { emoji: '⭐', name: 'ほし' },
        { emoji: '🐟', name: 'さかな' },
        { emoji: '🌸', name: 'はな' },
        { emoji: '🐱', name: 'ねこ' },
        { emoji: '🚗', name: 'くるま' },
    ];

    function buildUI() {
        gameContainer.textContent = '';

        const header = document.createElement('div');
        header.className = 'counting-header';

        const title = document.createElement('h2');
        title.textContent = 'かずかぞえ';

        const scoreEl = document.createElement('span');
        scoreEl.className = 'counting-score';
        scoreEl.textContent = 'スコア: 0';
        scoreEl.id = 'counting-score-display';

        header.appendChild(title);
        header.appendChild(scoreEl);
        gameContainer.appendChild(header);

        const questionEl = document.createElement('p');
        questionEl.className = 'counting-question';
        questionEl.id = 'counting-question';
        gameContainer.appendChild(questionEl);

        const objectsArea = document.createElement('div');
        objectsArea.className = 'counting-objects-area';
        objectsArea.id = 'counting-objects';
        gameContainer.appendChild(objectsArea);

        const choicesArea = document.createElement('div');
        choicesArea.className = 'counting-choices-area';
        choicesArea.id = 'counting-choices';
        gameContainer.appendChild(choicesArea);

        const feedbackEl = document.createElement('p');
        feedbackEl.className = 'counting-feedback';
        feedbackEl.id = 'counting-feedback';
        gameContainer.appendChild(feedbackEl);
    }

    function setupNewRound() {
        tapCount = 0;
        waitingForAnswer = false;

        const feedbackEl = document.getElementById('counting-feedback');
        feedbackEl.textContent = '';

        const choicesArea = document.getElementById('counting-choices');
        choicesArea.textContent = '';

        currentObject = objectSets[Math.floor(Math.random() * objectSets.length)];
        targetCount = Math.floor(Math.random() * maxNumber) + 1;

        const questionEl = document.getElementById('counting-question');
        questionEl.textContent = `${currentObject.name}をタップしてかぞえよう！`;

        const objectsArea = document.getElementById('counting-objects');
        objectsArea.textContent = '';

        for (let i = 0; i < targetCount; i++) {
            const obj = document.createElement('button');
            obj.className = 'counting-object-btn';
            obj.textContent = currentObject.emoji;
            obj.dataset.index = i;
            obj.addEventListener('click', () => handleObjectTap(obj, i));
            objectsArea.appendChild(obj);
        }
    }

    function handleObjectTap(element, index) {
        if (element.classList.contains('counted')) return;

        tapCount++;
        element.classList.add('counted');
        element.textContent = `${currentObject.emoji} ${tapCount}`;

        if (tapCount >= targetCount) {
            waitingForAnswer = true;
            showNumberChoices();
        }
    }

    function showNumberChoices() {
        const choicesArea = document.getElementById('counting-choices');
        choicesArea.textContent = '';

        const questionEl = document.getElementById('counting-question');
        questionEl.textContent = 'いくつあったかな？';

        const choicesCount = Math.min(maxNumber, 4);
        const choices = new Set([targetCount]);
        while (choices.size < choicesCount) {
            const n = Math.floor(Math.random() * maxNumber) + 1;
            choices.add(n);
        }

        const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);
        shuffled.forEach(num => {
            const btn = document.createElement('button');
            btn.className = 'counting-number-btn';
            btn.textContent = num;
            btn.addEventListener('click', () => checkAnswer(num, btn));
            choicesArea.appendChild(btn);
        });
    }

    function checkAnswer(selected, buttonElement) {
        if (!waitingForAnswer) return;
        waitingForAnswer = false;
        totalQuestions++;

        const feedbackEl = document.getElementById('counting-feedback');
        const isCorrect = selected === targetCount;

        if (isCorrect) {
            score++;
            buttonElement.classList.add('correct');
            feedbackEl.textContent = 'せいかい！ 🎉';
            feedbackEl.style.color = '#2e7d32';

            if (score >= 4 && maxNumber < 5) {
                maxNumber = 5;
            } else if (score >= 8 && maxNumber < 10) {
                maxNumber = 10;
            }
        } else {
            buttonElement.classList.add('incorrect');
            feedbackEl.textContent = `ざんねん... こたえは ${targetCount} だよ 💪`;
            feedbackEl.style.color = '#c62828';
        }

        const scoreEl = document.getElementById('counting-score-display');
        scoreEl.textContent = `スコア: ${score}`;

        setTimeout(() => setupNewRound(), 1800);
    }

    buildUI();
    setupNewRound();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initCountingGame);
}

if (typeof module !== 'undefined') {
    module.exports = { initCountingGame };
}
