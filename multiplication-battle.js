/**
 * 九九バトルゲーム
 * Multiplication Battle Game (Kuku) for ages 7-9
 */

function initMultiplicationBattle() {
    const gameContainer = document.getElementById('multiplication-battle-game');
    if (!gameContainer) return;

    const monsters = ['🐉', '🦖', '🕷️', '🦂', '🦈', '👹', '💀', '👺', '🐺', '🦇'];

    const stages = [
        { tables: [2, 3], label: 'にさんぐく' },
        { tables: [4, 5], label: 'しごく' },
        { tables: [6, 7], label: 'ろくしちく' },
        { tables: [8, 9], label: 'はちくく' },
        { tables: [2, 3, 4, 5, 6, 7, 8, 9], label: 'ミックス' },
    ];

    let currentStage = 0;
    let monstersDefeated = 0;
    let monsterEmoji = '';
    let monsterHP = 0;
    let maxMonsterHP = 0;
    let currentProblem = null;
    let totalCorrect = 0;

    function buildUI() {
        gameContainer.textContent = '';

        const stageDisplay = document.createElement('div');
        stageDisplay.className = 'kuku-stage-display';
        stageDisplay.id = 'kuku-stage';
        stageDisplay.textContent = `ステージ: ${stages[0].label}`;
        gameContainer.appendChild(stageDisplay);

        const screen = document.createElement('div');
        screen.id = 'kuku-battle-screen';

        const monsterArea = document.createElement('div');
        monsterArea.id = 'kuku-monster-area';

        const monsterEl = document.createElement('div');
        monsterEl.id = 'kuku-monster-emoji';

        const hpContainer = document.createElement('div');
        hpContainer.id = 'kuku-hp-bar-container';
        const hpBar = document.createElement('div');
        hpBar.id = 'kuku-hp-bar';
        hpContainer.appendChild(hpBar);

        const hpText = document.createElement('p');
        hpText.id = 'kuku-hp-text';

        monsterArea.appendChild(monsterEl);
        monsterArea.appendChild(hpContainer);
        monsterArea.appendChild(hpText);
        screen.appendChild(monsterArea);

        const playerArea = document.createElement('div');
        playerArea.id = 'kuku-player-area';

        const problemArea = document.createElement('div');
        problemArea.id = 'kuku-problem-area';

        const problemText = document.createElement('span');
        problemText.id = 'kuku-problem-text';

        const answerInput = document.createElement('input');
        answerInput.type = 'number';
        answerInput.id = 'kuku-answer-input';

        const submitBtn = document.createElement('button');
        submitBtn.id = 'kuku-submit-btn';
        submitBtn.textContent = 'こうげき！';

        problemArea.appendChild(problemText);
        problemArea.appendChild(answerInput);
        problemArea.appendChild(submitBtn);
        playerArea.appendChild(problemArea);
        screen.appendChild(playerArea);

        gameContainer.appendChild(screen);

        const messageEl = document.createElement('p');
        messageEl.id = 'kuku-battle-message';
        gameContainer.appendChild(messageEl);

        submitBtn.addEventListener('click', checkAnswer);
        answerInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') checkAnswer();
        });
    }

    function startGame() {
        currentStage = 0;
        monstersDefeated = 0;
        totalCorrect = 0;
        buildUI();
        spawnNewMonster();
    }

    function spawnNewMonster() {
        monsterEmoji = monsters[Math.floor(Math.random() * monsters.length)];
        maxMonsterHP = Math.min(2 + currentStage, 5);
        monsterHP = maxMonsterHP;

        const messageEl = document.getElementById('kuku-battle-message');
        messageEl.textContent = `あ！ ${monsterEmoji} があらわれた！`;

        const stageEl = document.getElementById('kuku-stage');
        stageEl.textContent = `ステージ: ${stages[currentStage].label}`;

        askNewQuestion();
    }

    function askNewQuestion() {
        const stage = stages[currentStage];
        const table = stage.tables[Math.floor(Math.random() * stage.tables.length)];
        const multiplier = Math.floor(Math.random() * 9) + 1;

        currentProblem = {
            text: `${table} × ${multiplier} = ?`,
            answer: table * multiplier,
        };

        updateDisplay();
    }

    function updateDisplay() {
        document.getElementById('kuku-monster-emoji').textContent = monsterEmoji;
        document.getElementById('kuku-hp-text').textContent = `HP: ${monsterHP} / ${maxMonsterHP}`;
        const hpBar = document.getElementById('kuku-hp-bar');
        const hpPercentage = (monsterHP / maxMonsterHP) * 100;
        hpBar.style.width = `${hpPercentage}%`;

        document.getElementById('kuku-problem-text').textContent = currentProblem.text;
        const answerInput = document.getElementById('kuku-answer-input');
        answerInput.value = '';
        answerInput.focus();
    }

    function checkAnswer() {
        const answerInput = document.getElementById('kuku-answer-input');
        const playerAnswer = parseInt(answerInput.value, 10);
        const messageEl = document.getElementById('kuku-battle-message');

        if (isNaN(playerAnswer)) {
            messageEl.textContent = 'すうじをいれてね！';
            return;
        }

        if (playerAnswer === currentProblem.answer) {
            totalCorrect++;
            messageEl.textContent = 'せいかい！モンスターに１のダメージ！ ⚔️';
            monsterHP--;

            if (monsterHP <= 0) {
                monstersDefeated++;
                messageEl.textContent = `やったー！ ${monsterEmoji} をやっつけた！ 🎉`;

                if (monstersDefeated >= 3 && currentStage < stages.length - 1) {
                    currentStage++;
                    monstersDefeated = 0;
                    messageEl.textContent = `ステージアップ！ ${stages[currentStage].label} 🎊`;
                }

                setTimeout(spawnNewMonster, 2000);
            } else {
                setTimeout(askNewQuestion, 1500);
            }
        } else {
            messageEl.textContent = 'ざんねん、こうげきがはずれた！もういちど！';
        }
        updateDisplay();
    }

    startGame();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initMultiplicationBattle);
}

if (typeof module !== 'undefined') {
    module.exports = { initMultiplicationBattle };
}
