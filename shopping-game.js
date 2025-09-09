document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('shopping-game');
    const items = [
        { name: 'りんご', emoji: '🍎', price: 10 },
        { name: 'バナナ', emoji: '🍌', price: 20 },
        { name: 'クッキー', emoji: '🍪', price: 30 },
        { name: '牛乳', emoji: '🥛', price: 40 },
        { name: 'パン', emoji: '🍞', price: 50 },
        { name: 'たまご', emoji: '🥚', price: 60 },
    ];

    let targetAmount = 0;
    let cart = [];

    function startGame() {
        gameContainer.innerHTML = `
            <div id="game-board">
                <div id="mission-panel">
                    <p>もくひょうきんがく</p>
                    <h2 id="target-amount"></h2>
                </div>
                <div id="cart-panel">
                    <p>えらんだもの</p>
                    <div id="cart-items"></div>
                    <p>ごうけい: <span id="current-total">0</span>円</p>
                </div>
            </div>
            <div id="item-shelf"></div>
            <div id="game-controls">
                <button id="check-answer-btn">できた！</button>
                <button id="reset-cart-btn">やりなおし</button>
            </div>
            <p id="game-message"></p>
        `;
        setupNewRound();
    }

    function setupNewRound() {
        cart = [];
        // 10円単位で、50円から150円の範囲で目標金額をランダムに設定
        targetAmount = (Math.floor(Math.random() * 11) + 5) * 10;

        render();

        document.getElementById('check-answer-btn').addEventListener('click', checkAnswer);
        document.getElementById('reset-cart-btn').addEventListener('click', () => {
            cart = [];
            render();
        });
    }

    function render() {
        const targetAmountEl = document.getElementById('target-amount');
        const itemShelfEl = document.getElementById('item-shelf');
        const cartItemsEl = document.getElementById('cart-items');
        const currentTotalEl = document.getElementById('current-total');
        const gameMessageEl = document.getElementById('game-message');

        targetAmountEl.textContent = `${targetAmount}円`;
        gameMessageEl.textContent = '';
        itemShelfEl.innerHTML = '';
        cartItemsEl.innerHTML = '';

        // 商品棚に商品を並べる
        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('shop-item');
            itemEl.innerHTML = `<span class="item-emoji">${item.emoji}</span><span class="item-price">${item.price}円</span>`;
            itemEl.addEventListener('click', () => addToCart(item));
            itemShelfEl.appendChild(itemEl);
        });

        // カートの中身を表示
        let currentTotal = 0;
        cart.forEach((item, index) => {
            const cartItemEl = document.createElement('div');
            cartItemEl.classList.add('cart-item');
            cartItemEl.textContent = item.emoji;
            cartItemEl.addEventListener('click', () => removeFromCart(index));
            cartItemsEl.appendChild(cartItemEl);
            currentTotal += item.price;
        });

        currentTotalEl.textContent = currentTotal;
    }

    function addToCart(item) {
        cart.push(item);
        render();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        render();
    }

    function checkAnswer() {
        const currentTotal = cart.reduce((sum, item) => sum + item.price, 0);
        const gameMessageEl = document.getElementById('game-message');
        if (currentTotal === targetAmount) {
            gameMessageEl.textContent = 'せいかい！ぴったりだね！ ⭐️';
            setTimeout(setupNewRound, 2500);
        } else {
            gameMessageEl.textContent = 'ちがうみたい。もういちどけいさんしてみよう！';
        }
    }

    startGame();
});
