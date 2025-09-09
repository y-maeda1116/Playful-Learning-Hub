document.addEventListener('DOMContentLoaded', () => {
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
        resultMessage.textContent = '';
        animalChoices.innerHTML = '';

        // ランダムに正解の動物を選ぶ
        correctAnimal = animals[Math.floor(Math.random() * animals.length)];

        // "音を鳴らす" ボタンのダミー処理
        // 本来はここで correctAnimal.sound を再生します
        console.log(`再生する音: ${correctAnimal.name}の鳴き声`);

        // 選択肢を作成
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
            // 正解したら少し待って次の問題へ
            setTimeout(startQuiz, 2000);
        } else {
            resultMessage.textContent = 'ちがうよ。もういっかい！';
        }
    }

    soundButton.addEventListener('click', () => {
        // 実際の音声再生機能はまだありません
        alert('（ここに動物の鳴き声が流れます）');
    });

    // クイズを開始
    startQuiz();
});
