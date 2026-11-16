function initClassificationGame() {
    const gameContainer = document.getElementById('classification-game');
    if (!gameContainer) {
        return;
    }

    const items = [
        { emoji: '🍎', type: 'fruit' },
        { emoji: '🍌', type: 'fruit' },
        { emoji: '🍇', type: 'fruit' },
        { emoji: '🍓', type: 'fruit' },
        { emoji: '🚗', type: 'vehicle' },
        { emoji: '✈️', type: 'vehicle' },
        { emoji: '⚽', type: 'toy' },
        { emoji: '🏠', type: 'place' },
        { emoji: '🐶', type: 'animal' },
    ];

    const categories = {
        fruit: 'くだもの',
        vehicle: 'のりもの',
        animal: 'どうぶつ'
    };

    let currentCategory;

    function startGame() {
        gameContainer.innerHTML = `
            <h2 id="game-question"></h2>
            <div id="item-choices"></div>
            <p id="game-result"></p>
        `;

        const questionElement = document.getElementById('game-question');
        const choicesContainer = document.getElementById('item-choices');
        const resultElement = document.getElementById('game-result');

        setupNewRound(questionElement, choicesContainer, resultElement);
    }

    function setupNewRound(questionElement, choicesContainer, resultElement) {
        resultElement.textContent = '';
        choicesContainer.innerHTML = '';

        const categoryKeys = Object.keys(categories);
        currentCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];

        questionElement.textContent = `${categories[currentCategory]} はどれかな？`;

        const correctItems = items.filter(item => item.type === currentCategory);
        const wrongItems = items.filter(item => item.type !== currentCategory);

        const choices = [];
        choices.push(correctItems[Math.floor(Math.random() * correctItems.length)]);
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * wrongItems.length);
            choices.push(wrongItems.splice(randomIndex, 1)[0]);
        }

        const shuffledChoices = choices.sort(() => Math.random() - 0.5);

        shuffledChoices.forEach(item => {
            const choiceElement = document.createElement('div');
            choiceElement.classList.add('item-choice');
            choiceElement.textContent = item.emoji;
            choiceElement.dataset.type = item.type;
            choiceElement.addEventListener('click', () => checkAnswer(item, resultElement, questionElement, choicesContainer));
            choicesContainer.appendChild(choiceElement);
        });
    }

    function checkAnswer(selectedItem, resultElement, questionElement, choicesContainer) {
        if (selectedItem.type === currentCategory) {
            resultElement.textContent = 'せいかい！よくできたね！ 🎉';
            setTimeout(() => setupNewRound(questionElement, choicesContainer, resultElement), 2000);
        } else {
            resultElement.textContent = 'ちがうみたい。もういちどさがしてみよう！';
        }
    }

    startGame();
}

// Browser environment
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initClassificationGame);
}

// Node.js for testing
if (typeof module !== 'undefined') {
    module.exports = { initClassificationGame };
}
