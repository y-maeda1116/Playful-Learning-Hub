function initUserContent() {
    const createQuizForm = document.getElementById('create-quiz-form');
    if (!createQuizForm) return;
    const userQuizList = document.getElementById('user-quiz-list');
    const quizModal = document.getElementById('quiz-modal');
    const closeModalButton = quizModal.querySelector('.close-button');

    const inappropriateWords = ['馬鹿', 'ばか', 'アホ', 'あほ', '死ね', 'しね'];
    let quizzes = [];

    function filterText(text) {
        let filteredText = text;
        for (const word of inappropriateWords) {
            const regex = new RegExp(word, 'g');
            filteredText = filteredText.replace(regex, '***');
        }
        return filteredText;
    }

    function saveQuizzes() {
        localStorage.setItem('userQuizzes', JSON.stringify(quizzes));
    }

    function loadQuizzes() {
        const storedQuizzes = localStorage.getItem('userQuizzes');
        if (storedQuizzes) {
            quizzes = JSON.parse(storedQuizzes);
        }
        displayQuizzes();
    }

    function displayQuizzes() {
        userQuizList.innerHTML = '';
        quizzes.forEach((quiz, index) => {
            const quizCard = document.createElement('div');
            quizCard.className = 'quiz-card';
            quizCard.innerHTML = `
                <h4>${filterText(quiz.title)}</h4>
                <button class="play-quiz-btn" data-index="${index}">プレイ</button>
                <button class="report-quiz-btn" data-index="${index}">報告</button>
            `;
            userQuizList.appendChild(quizCard);
        });

        document.querySelectorAll('.play-quiz-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                openQuizModal(quizzes[index]);
            });
        });

        document.querySelectorAll('.report-quiz-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                reportQuiz(index);
            });
        });
    }

    createQuizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('quiz-title').value;
        const question = document.getElementById('quiz-question').value;
        const imageInput = document.getElementById('quiz-image');
        const choices = Array.from(document.querySelectorAll('.quiz-choice')).map(input => input.value);

        const reader = new FileReader();
        reader.onload = function(event) {
            const newQuiz = {
                title: filterText(title),
                question: filterText(question),
                image: event.target.result,
                choices: choices.map(choice => filterText(choice)),
                correctAnswer: filterText(choices[0]),
            };
            quizzes.push(newQuiz);
            saveQuizzes();
            displayQuizzes();
            createQuizForm.reset();
        };

        if (imageInput.files[0]) {
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            const newQuiz = {
                title: filterText(title),
                question: filterText(question),
                image: null,
                choices: choices.map(choice => filterText(choice)),
                correctAnswer: filterText(choices[0]),
            };
            quizzes.push(newQuiz);
            saveQuizzes();
            displayQuizzes();
            createQuizForm.reset();
        }
    });

    function openQuizModal(quiz) {
        document.getElementById('modal-quiz-title').textContent = quiz.title;
        document.getElementById('modal-quiz-question').textContent = quiz.question;
        const imageElement = document.getElementById('modal-quiz-image');
        if (quiz.image) {
            imageElement.src = quiz.image;
            imageElement.style.display = 'block';
        } else {
            imageElement.style.display = 'none';
        }

        const choicesContainer = document.getElementById('modal-quiz-choices');
        choicesContainer.innerHTML = '';
        const shuffledChoices = [...quiz.choices].sort(() => Math.random() - 0.5);
        shuffledChoices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.className = 'choice-btn';
            button.addEventListener('click', () => {
                checkAnswer(choice, quiz.correctAnswer);
            });
            choicesContainer.appendChild(button);
        });

        document.getElementById('modal-quiz-feedback').textContent = '';
        quizModal.style.display = 'block';
    }

    function checkAnswer(selectedChoice, correctAnswer) {
        const feedback = document.getElementById('modal-quiz-feedback');
        if (selectedChoice === correctAnswer) {
            feedback.textContent = 'せいかい！ 🎉';
            feedback.style.color = 'green';
        } else {
            feedback.textContent = 'ちがうよ。もういっかい！';
            feedback.style.color = 'red';
        }
        setTimeout(() => {
            closeModal();
        }, 2000);
    }

    function closeModal() {
        quizModal.style.display = 'none';
    }

    function reportQuiz(index) {
        console.log(`Quiz reported: ${quizzes[index].title}`);
        alert('クイズが報告されました。');
    }

    closeModalButton.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === quizModal) {
            closeModal();
        }
    });

    loadQuizzes();
}

document.addEventListener('DOMContentLoaded', initUserContent);

if (typeof module !== 'undefined') {
    module.exports = { initUserContent };
}
