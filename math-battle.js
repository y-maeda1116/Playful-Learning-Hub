document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('math-battle-game');
    const monsters = ['👹', '👻', '👾', '👽', '💀', '👺'];

    let monsterEmoji = '';
    let monsterHP = 0;
    let maxMonsterHP = 0;
    let currentProblem = null;

    function startGame() {
        gameContainer.innerHTML = `
            <div id="battle-screen">
                <div id="monster-area">
                    <div id="monster-emoji"></div>
                    <div id="hp-bar-container">
                        <div id="hp-bar"></div>
                    </div>
                    <p id="hp-text"></p>
                </div>
                <div id="player-area">
                    <div id="problem-area">
                        <span id="problem-text"></span>
                        <input type="number" id="answer-input" />
                        <button id="submit-answer-btn">こうげき！</button>
                    </div>
                </div>
            </div>
            <p id="battle-message"></p>
        `;
        document.getElementById('submit-answer-btn').addEventListener('click', checkAnswer);
        document.getElementById('answer-input').addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                checkAnswer();
            }
        });

        spawnNewMonster();
    }

    function spawnNewMonster() {
        monsterEmoji = monsters[Math.floor(Math.random() * monsters.length)];
        maxMonsterHP = Math.floor(Math.random() * 3) + 2; // HP: 2 to 4
        monsterHP = maxMonsterHP;
        document.getElementById('battle-message').textContent = `あ！ ${monsterEmoji} があらわれた！`;
        askNewQuestion();
    }

    function askNewQuestion() {
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        const operator = Math.random() > 0.5 ? '+' : '-';

        if (operator === '-' && num1 < num2) {
            // Ensure the result is not negative
            [num1, num2] = [num2, num1];
        }

        const answer = operator === '+' ? num1 + num2 : num1 - num2;
        currentProblem = { text: `${num1} ${operator} ${num2} = ?`, answer: answer };

        updateDisplay();
    }

    function updateDisplay() {
        document.getElementById('monster-emoji').textContent = monsterEmoji;
        document.getElementById('hp-text').textContent = `HP: ${monsterHP} / ${maxMonsterHP}`;
        const hpBar = document.getElementById('hp-bar');
        const hpPercentage = (monsterHP / maxMonsterHP) * 100;
        hpBar.style.width = `${hpPercentage}%`;

        document.getElementById('problem-text').textContent = currentProblem.text;
        document.getElementById('answer-input').value = '';
        document.getElementById('answer-input').focus();
    }

    function checkAnswer() {
        const playerAnswer = parseInt(document.getElementById('answer-input').value, 10);
        const battleMessageEl = document.getElementById('battle-message');

        if (isNaN(playerAnswer)) {
            battleMessageEl.textContent = 'すうじをいれてね！';
            return;
        }

        if (playerAnswer === currentProblem.answer) {
            battleMessageEl.textContent = 'せいかい！モンスターに１のダメージ！';
            monsterHP--;

            if (monsterHP <= 0) {
                battleMessageEl.textContent = `やったー！ ${monsterEmoji} をやっつけた！`;
                setTimeout(spawnNewMonster, 2000);
            } else {
                setTimeout(askNewQuestion, 1500);
            }
        } else {
            battleMessageEl.textContent = 'ざんねん、こうげきがはずれた！もういちど！';
        }
        updateDisplay();
    }

    startGame();
});
