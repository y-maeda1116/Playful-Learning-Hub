document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('classification-game');
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
        // ゲームのHTML構造を生成
        gameContainer.innerHTML = `
            <h2 id="game-question"></h2>
            <div id="item-choices"></div>
            <p id="game-result"></p>
        `;

        const questionElement = document.getElementById('game-question');
        const choicesContainer = document.getElementById('item-choices');
        const resultElement = document.getElementById('game-result');

        // 新しい問題を設定
        setupNewRound(questionElement, choicesContainer, resultElement);
    }

    function setupNewRound(questionElement, choicesContainer, resultElement) {
        resultElement.textContent = '';
        choicesContainer.innerHTML = '';

        // ランダムなカテゴリを選ぶ
        const categoryKeys = Object.keys(categories);
        currentCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];

        questionElement.textContent = `${categories[currentCategory]} はどれかな？`;

        // 選択肢を準備
        const correctItems = items.filter(item => item.type === currentCategory);
        const wrongItems = items.filter(item => item.type !== currentCategory);

        // 正解を1つ、間違いを3つ選ぶ
        const choices = [];
        choices.push(correctItems[Math.floor(Math.random() * correctItems.length)]);
        for (let i = 0; i < 3; i++) {
            choices.push(wrongItems.splice(Math.floor(Math.random() * wrongItems.length), 1)[0]);
        }

        // 選択肢をシャッフル
        const shuffledChoices = choices.sort(() => Math.random() - 0.5);

        // 選択肢を表示
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

    // ゲームを開始
    startGame();
});
