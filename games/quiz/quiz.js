function initQuizGame() {
    const quizContainer = document.getElementById('animal-sounds-quiz');
    if (!quizContainer) {
        return;
    }

    const animals = [
        { name: 'いぬ', emoji: '🐶', sound: 'sounds/dog.mp3' },
        { name: 'ねこ', emoji: '🐱', sound: 'sounds/cat.mp3' },
        { name: 'ぞう', emoji: '🐘', sound: 'sounds/elephant.mp3' },
        { name: 'ライオン', emoji: '🦁', sound: 'sounds/lion.mp3' }
    ];

    let correctAnimal;
    const soundButton = document.getElementById('play-sound-button');
    const animalChoices = document.getElementById('animal-choices');
    const resultMessage = document.getElementById('result-message');

    function startQuiz() {
        if (!animalChoices) return;
        resultMessage.textContent = '';
        animalChoices.innerHTML = '';

        correctAnimal = animals[Math.floor(Math.random() * animals.length)];
        console.log(`再生する音: ${correctAnimal.name}の鳴き声`);

        animals.forEach(animal => {
            const choiceElement = document.createElement('div');
            choiceElement.classList.add('animal-choice');
            choiceElement.textContent = animal.emoji;
            choiceElement.dataset.name = animal.name;
            choiceElement.addEventListener('click', checkAnswer);
            animalChoices.appendChild(choiceElement);
        });
    }

    function checkAnswer(event) {
        const selectedName = event.target.dataset.name;
        if (selectedName === correctAnimal.name) {
            resultMessage.textContent = 'せいかい！ 🎉';
            setTimeout(startQuiz, 2000);
        } else {
            resultMessage.textContent = 'ちがうよ。もういっかい！';
        }
    }

    if (soundButton) {
        soundButton.addEventListener('click', () => {
            alert('（ここに動物の鳴き声が流れます）');
        });
    }

    startQuiz();
}

// Browser environment
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initQuizGame);
}

// Node.js for testing
if (typeof module !== 'undefined') {
    module.exports = { initQuizGame };
}
