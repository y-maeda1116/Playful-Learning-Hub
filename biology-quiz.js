function initBiologyQuiz() {
    const quizContainer = document.getElementById('biology-quiz');
    if (!quizContainer) {
        return;
    }

    const questions = [
        { image: 'images/lion.jpg', choices: ['ライオン', 'トラ', 'チーター'], answer: 'ライオン', sound: 'sounds/lion.mp3' },
        { image: 'images/rose.jpg', choices: ['バラ', 'チューリップ', 'ひまわり'], answer: 'バラ', sound: null },
        { image: 'images/whale.jpg', choices: ['クジラ', 'イルカ', 'シャチ'], answer: 'クジラ', sound: 'sounds/whale.mp3' },
        { image: 'images/sunflower.jpg', choices: ['ひまわり', 'たんぽぽ', 'バラ'], answer: 'ひまわり', sound: null }
    ];

    let currentQuestion;

    const imageElement = document.getElementById('quiz-image');
    const choicesElement = document.getElementById('quiz-choices');
    const resultElement = document.getElementById('quiz-result');
    const soundButton = document.getElementById('play-quiz-sound-button');

    function loadQuestion() {
        resultElement.textContent = '';
        choicesElement.innerHTML = '';
        imageElement.classList.remove('correct-answer-animation');

        currentQuestion = questions[Math.floor(Math.random() * questions.length)];

        imageElement.src = currentQuestion.image;

        if (currentQuestion.sound) {
            soundButton.style.display = 'inline-block';
        } else {
            soundButton.style.display = 'none';
        }

        const choices = [...currentQuestion.choices];
        shuffleArray(choices);

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.classList.add('choice-btn');
            button.addEventListener('click', () => checkAnswer(choice));
            choicesElement.appendChild(button);
        });
    }

    function checkAnswer(selectedChoice) {
        // Disable choice buttons after an answer
        const choiceButtons = choicesElement.querySelectorAll('.choice-btn');
        choiceButtons.forEach(button => button.disabled = true);

        if (selectedChoice === currentQuestion.answer) {
            resultElement.textContent = 'せいかい！ 🎉';
            resultElement.style.color = 'green';
            imageElement.classList.add('correct-answer-animation');
            setTimeout(() => {
                choiceButtons.forEach(button => button.disabled = false);
                loadQuestion();
            }, 2000);
        } else {
            resultElement.textContent = 'ちがうよ。もういっかい！';
            resultElement.style.color = 'red';
            setTimeout(() => {
                choiceButtons.forEach(button => button.disabled = false);
                resultElement.textContent = '';
            }, 1500);
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    soundButton.addEventListener('click', () => {
        if (currentQuestion && currentQuestion.sound) {
            alert(`（ここに${currentQuestion.answer}の鳴き声が流れます）`);
        }
    });

    loadQuestion();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initBiologyQuiz);
}

if (typeof module !== 'undefined') {
    module.exports = { initBiologyQuiz };
}
