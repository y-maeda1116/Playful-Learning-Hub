document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('speed-game');

    let currentProblem = null;

    function startGame() {
        gameContainer.innerHTML = `
            <div id="problem-display">
                <p id="problem-text"></p>
            </div>
            <div id="answer-section">
                <input type="number" id="player-answer" placeholder="こたえ">
                <span id="answer-unit"></span>
                <button id="submit-btn">回答</button>
            </div>
            <p id="feedback-message"></p>
        `;
        document.getElementById('submit-btn').addEventListener('click', checkAnswer);
        document.getElementById('player-answer').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') checkAnswer();
        });

        generateNewProblem();
    }

    function generateNewProblem() {
        const problemType = Math.floor(Math.random() * 3); // 0: solve for distance, 1: speed, 2: time

        let speed, time, distance;
        let question = '';
        let answer, unit;

        if (problemType === 0) { // 道のりを求める
            speed = (Math.floor(Math.random() * 10) + 5) * 10; // 50-140 km/h
            time = Math.floor(Math.random() * 4) + 2; // 2-5 hours
            distance = speed * time;
            question = `時速 ${speed} kmで ${time} 時間進むと、何km進みますか？`;
            answer = distance;
            unit = 'km';
        } else if (problemType === 1) { // 速さを求める
            time = Math.floor(Math.random() * 4) + 2; // 2-5 hours
            speed = (Math.floor(Math.random() * 8) + 5) * 10; // 50-120 km/h
            distance = speed * time;
            question = `${distance} kmの道のりを ${time} 時間で進むには、時速何kmである必要がありますか？`;
            answer = speed;
            unit = 'km/h';
        } else { // 時間を求める
            speed = (Math.floor(Math.random() * 6) + 5) * 10; // 50-100 km/h
            time = Math.floor(Math.random() * 5) + 2; // 2-6 hours
            distance = speed * time;
            question = `時速 ${speed} kmで ${distance} km進むには、何時間かかりますか？`;
            answer = time;
            unit = '時間';
        }

        currentProblem = { question, answer, unit };
        updateDisplay();
    }

    function updateDisplay() {
        document.getElementById('problem-text').textContent = currentProblem.question;
        document.getElementById('answer-unit').textContent = currentProblem.unit;
        document.getElementById('player-answer').value = '';
        document.getElementById('feedback-message').textContent = '';
        document.getElementById('player-answer').focus();
    }

    function checkAnswer() {
        const playerAnswer = parseFloat(document.getElementById('player-answer').value);
        const feedbackEl = document.getElementById('feedback-message');

        if (isNaN(playerAnswer)) {
            feedbackEl.textContent = '数値を入力してください。';
            return;
        }

        if (playerAnswer === currentProblem.answer) {
            feedbackEl.textContent = '正解です！素晴らしい！';
            feedbackEl.style.color = 'green';
            setTimeout(generateNewProblem, 2000);
        } else {
            feedbackEl.textContent = `残念、不正解です。もう一度考えてみましょう。`;
            feedbackEl.style.color = 'red';
        }
    }

    startGame();
});
