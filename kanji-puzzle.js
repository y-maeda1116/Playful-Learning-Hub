/**
 * 漢字パズルゲーム
 * Kanji Puzzle Game for ages 7-12
 *
 * Note: innerHTML usage is limited to empty string assignments for clearing
 * containers. All dynamic content is created via DOM APIs (textContent, createElement).
 */

const { kanjiData, kanjiCompositions } = require('./kanji-data.js');

class KanjiPuzzle {
    constructor(container, options = {}) {
        this.container = container;
        this.ageGroup = options.ageGroup || '7-8';
        this.currentGrade = options.startGrade || 1;
        this.score = 0;
        this.totalQuestions = 0;
        this.correctInLevel = 0;
        this.isGameActive = false;
        this.currentProblem = null;

        this.difficultySettings = {
            '7-8':   { grades: [1, 2], choicesCount: 4, types: ['reading'] },
            '9-10':  { grades: [2, 3, 4], choicesCount: 4, types: ['reading', 'composition'] },
            '11-12': { grades: [4, 5, 6], choicesCount: 4, types: ['reading', 'composition'] },
        };

        this.kanjiDatabase = kanjiData;
        this.compositions = kanjiCompositions;
        this.correctThreshold = 5;

        this.initializeGame();
    }

    getAvailableKanji() {
        const settings = this.difficultySettings[this.ageGroup];
        const maxGrade = Math.min(
            this.currentGrade,
            settings.grades[settings.grades.length - 1]
        );
        const allKanji = [];
        for (let g = 1; g <= maxGrade; g++) {
            const gradeKey = `grade${g}`;
            if (this.kanjiDatabase[gradeKey]) {
                allKanji.push(...this.kanjiDatabase[gradeKey]);
            }
        }
        return allKanji;
    }

    initializeGame() {
        if (!this.container) return;

        this.clearContainer(this.container);

        const header = document.createElement('div');
        header.className = 'kanji-puzzle-header';

        this.scoreDisplay = document.createElement('span');
        this.scoreDisplay.className = 'kanji-score';
        this.scoreDisplay.textContent = 'スコア: 0';

        this.gradeDisplay = document.createElement('span');
        this.gradeDisplay.className = 'kanji-grade';
        this.gradeDisplay.textContent = `小学${this.currentGrade}年`;

        header.appendChild(this.scoreDisplay);
        header.appendChild(this.gradeDisplay);
        this.container.appendChild(header);

        this.questionArea = document.createElement('div');
        this.questionArea.className = 'kanji-question-area';
        this.container.appendChild(this.questionArea);

        this.choicesArea = document.createElement('div');
        this.choicesArea.className = 'kanji-choices-area';
        this.container.appendChild(this.choicesArea);

        this.feedbackArea = document.createElement('p');
        this.feedbackArea.className = 'kanji-feedback';
        this.container.appendChild(this.feedbackArea);

        this.startNewGame();
    }

    clearContainer(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    startNewGame() {
        this.score = 0;
        this.totalQuestions = 0;
        this.correctInLevel = 0;
        this.currentGrade = this.difficultySettings[this.ageGroup].grades[0];
        this.isGameActive = true;
        this.updateDisplay();
        this.startNewRound();
    }

    startNewRound() {
        if (!this.isGameActive) return;

        this.feedbackArea.textContent = '';
        const settings = this.difficultySettings[this.ageGroup];
        const type = settings.types[Math.floor(Math.random() * settings.types.length)];

        if (type === 'reading') {
            this.currentProblem = this.generateReadingProblem();
        } else {
            this.currentProblem = this.generateCompositionProblem();
        }

        this.renderProblem();
    }

    generateReadingProblem() {
        const available = this.getAvailableKanji();
        if (available.length === 0) {
            return null;
        }

        const target = available[Math.floor(Math.random() * available.length)];
        const correctReading = target.reading.split('/')[0];

        const distractors = available
            .filter(k => k.kanji !== target.kanji)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(k => k.reading.split('/')[0]);

        const choices = [correctReading, ...distractors]
            .sort(() => Math.random() - 0.5);

        return {
            type: 'reading',
            display: target.kanji,
            hint: target.hint,
            meaning: target.meaning,
            answer: correctReading,
            choices,
        };
    }

    generateCompositionProblem() {
        const available = this.compositions.filter(c =>
            this.getAvailableKanji().some(k => k.kanji === c.result)
        );

        if (available.length === 0) {
            return this.generateReadingProblem();
        }

        const target = available[Math.floor(Math.random() * available.length)];

        const distractors = this.getAvailableKanji()
            .filter(k => k.kanji !== target.result)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(k => k.kanji);

        const choices = [target.result, ...distractors]
            .sort(() => Math.random() - 0.5);

        return {
            type: 'composition',
            display: `${target.left} + ${target.right}`,
            hint: target.hint,
            answer: target.result,
            choices,
        };
    }

    renderProblem() {
        if (!this.currentProblem) return;

        this.clearContainer(this.questionArea);

        if (this.currentProblem.type === 'reading') {
            const kanjiChar = document.createElement('div');
            kanjiChar.className = 'kanji-display-char';
            kanjiChar.textContent = this.currentProblem.display;
            this.questionArea.appendChild(kanjiChar);

            const meaningEl = document.createElement('div');
            meaningEl.className = 'kanji-hint';
            meaningEl.textContent = `${this.currentProblem.hint} ${this.currentProblem.meaning}`;
            this.questionArea.appendChild(meaningEl);

            const prompt = document.createElement('p');
            prompt.className = 'kanji-prompt';
            prompt.textContent = 'この漢字の読み方は？';
            this.questionArea.appendChild(prompt);
        } else {
            const compDisplay = document.createElement('div');
            compDisplay.className = 'kanji-composition-display';
            compDisplay.textContent = this.currentProblem.display;
            this.questionArea.appendChild(compDisplay);

            const hintEl = document.createElement('div');
            hintEl.className = 'kanji-hint';
            hintEl.textContent = `ヒント: ${this.currentProblem.hint}`;
            this.questionArea.appendChild(hintEl);

            const prompt = document.createElement('p');
            prompt.className = 'kanji-prompt';
            prompt.textContent = '組み合わせてできる漢字は？';
            this.questionArea.appendChild(prompt);
        }

        this.clearContainer(this.choicesArea);
        this.currentProblem.choices.forEach((choice) => {
            const btn = document.createElement('button');
            btn.className = 'kanji-choice-btn';
            btn.textContent = choice;
            btn.addEventListener('click', () => this.checkAnswer(choice, btn));
            this.choicesArea.appendChild(btn);
        });
    }

    checkAnswer(selected, buttonElement) {
        if (!this.isGameActive || !this.currentProblem) return;

        this.totalQuestions++;
        const isCorrect = selected === this.currentProblem.answer;

        if (isCorrect) {
            this.score++;
            this.correctInLevel++;
            buttonElement.classList.add('correct');
            this.feedbackArea.textContent = 'せいかい！すばらしい！ ✨';
            this.feedbackArea.style.color = '#2e7d32';

            if (this.correctInLevel >= this.correctThreshold) {
                this.advanceGrade();
            }
        } else {
            buttonElement.classList.add('incorrect');
            this.feedbackArea.textContent = `ざんねん... こたえは「${this.currentProblem.answer}」です 💪`;
            this.feedbackArea.style.color = '#c62828';
        }

        this.updateDisplay();

        setTimeout(() => {
            if (this.isGameActive) {
                this.startNewRound();
            }
        }, 1500);
    }

    advanceGrade() {
        const settings = this.difficultySettings[this.ageGroup];
        const maxGrade = settings.grades[settings.grades.length - 1];

        if (this.currentGrade < maxGrade) {
            this.currentGrade++;
            this.correctInLevel = 0;
            this.feedbackArea.textContent = `小学${this.currentGrade}年にレベルアップ！ 🎉`;
        }
    }

    updateDisplay() {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `スコア: ${this.score}`;
        }
        if (this.gradeDisplay) {
            this.gradeDisplay.textContent = `小学${this.currentGrade}年`;
        }
    }

    getProgress() {
        return {
            score: this.score,
            currentGrade: this.currentGrade,
            totalQuestions: this.totalQuestions,
            isGameActive: this.isGameActive,
        };
    }

    destroy() {
        this.isGameActive = false;
        if (this.container) {
            this.clearContainer(this.container);
        }
    }
}

// ブラウザ環境でのグローバル設定
if (typeof window !== 'undefined') {
    window.KanjiPuzzle = KanjiPuzzle;
}

// Node.js環境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KanjiPuzzle };
}
