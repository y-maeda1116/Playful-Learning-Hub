function initMoneyGame() {
    const gameContainer = document.getElementById('money-game');
    if (!gameContainer) {
        return;
    }

    const items = [
        { name: 'おかし', emoji: '🍬', price: 35 },
        { name: 'ジュース', emoji: '🥤', price: 120 },
        { name: 'パン', emoji: '🍞', price: 150 },
        { name: 'アイス', emoji: '🍦', price: 80 },
        { name: 'おもちゃ', emoji: '🧸', price: 230 },
        { name: 'ふうせん', emoji: '🎈', price: 55 },
    ];

    const coins = [
        { value: 100, label: '100円', type: 'bill' },
        { value: 50, label: '50円', type: 'coin' },
        { value: 10, label: '10円', type: 'coin' },
        { value: 5, label: '5円', type: 'coin' },
        { value: 1, label: '1円', type: 'coin' },
    ];

    let currentItem;
    let paidAmount;

    function startGame() {
        gameContainer.innerHTML = `
            <h2>おかねのけいさんゲーム</h2>
            <div id="money-game-board">
                <div id="product-display">
                    <div id="product-emoji"></div>
                    <div id="product-price"></div>
                </div>
                <div id="payment-area">
                    <p>はらったおかね</p>
                    <div id="paid-display">0円</div>
                    <div id="paid-coins"></div>
                </div>
            </div>
            <p>↓ おかねをタップしてはらってね ↓</p>
            <div id="coin-selection"></div>
            <div id="money-game-controls">
                <button id="check-money-btn">これでOK！</button>
                <button id="reset-money-btn">やりなおし</button>
            </div>
            <p id="money-game-message"></p>
        `;
        setupNewRound();
    }

    function setupNewRound() {
        currentItem = items[Math.floor(Math.random() * items.length)];
        paidAmount = 0;
        render();

        document.getElementById('check-money-btn').addEventListener('click', checkAnswer);
        document.getElementById('reset-money-btn').addEventListener('click', () => {
            paidAmount = 0;
            render();
        });
    }

    function render() {
        const productEmojiEl = document.getElementById('product-emoji');
        const productPriceEl = document.getElementById('product-price');
        const paidDisplayEl = document.getElementById('paid-display');
        const paidCoinsEl = document.getElementById('paid-coins');
        const coinSelectionEl = document.getElementById('coin-selection');
        const gameMessageEl = document.getElementById('money-game-message');

        productEmojiEl.textContent = currentItem.emoji;
        productPriceEl.textContent = `${currentItem.price}円`;
        paidDisplayEl.textContent = `${paidAmount}円`;
        gameMessageEl.textContent = '';
        paidCoinsEl.innerHTML = ''; // Simple display for now
        coinSelectionEl.innerHTML = '';

        coins.forEach(coin => {
            const coinEl = document.createElement('button');
            coinEl.classList.add('coin');
            coinEl.textContent = coin.label;
            coinEl.addEventListener('click', () => handleCoinClick(coin.value));
            coinSelectionEl.appendChild(coinEl);
        });
    }

    function handleCoinClick(value) {
        paidAmount += value;
        render();
    }

    function checkAnswer() {
        const gameMessageEl = document.getElementById('money-game-message');
        if (paidAmount === currentItem.price) {
            gameMessageEl.textContent = 'せいかい！じょうずにできたね！ ✨';
            setTimeout(setupNewRound, 2500);
        } else if (paidAmount > currentItem.price) {
            gameMessageEl.textContent = `おおいみたい。あと ${paidAmount - currentItem.price}円 おおいよ。`;
        } else {
            gameMessageEl.textContent = `たりないみたい。あと ${currentItem.price - paidAmount}円 いるよ。`;
        }
    }

    startGame();
}

// Browser environment
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initMoneyGame);
}

// Node.js for testing
if (typeof module !== 'undefined') {
    module.exports = { initMoneyGame };
}
