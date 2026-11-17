/**
 * 図形パズルゲーム
 * Shape Puzzle Game for ages 5-8
 */

function initShapePuzzle() {
    const gameContainer = document.getElementById('shape-puzzle-game');
    if (!gameContainer) return;

    let currentPuzzle = null;
    let score = 0;
    let totalQuestions = 0;
    let difficulty = 'easy';

    const puzzles = [
        {
            target: '長方形',
            targetShape: 'rect',
            components: ['triangle', 'triangle'],
            distractors: [['circle', 'circle'], ['triangle', 'circle']],
            hint: 'ちょうほうけい',
            difficulty: 'easy',
        },
        {
            target: '家',
            targetShape: 'house',
            components: ['triangle', 'square'],
            distractors: [['circle', 'square'], ['triangle', 'circle']],
            hint: 'いえ',
            difficulty: 'easy',
        },
        {
            target: 'ひし形',
            targetShape: 'diamond',
            components: ['triangle', 'triangle'],
            distractors: [['square', 'triangle'], ['circle', 'triangle']],
            hint: 'ひしがた',
            difficulty: 'easy',
        },
        {
            target: '六角形',
            targetShape: 'hexagon',
            components: ['trapezoid', 'trapezoid'],
            distractors: [['triangle', 'square'], ['circle', 'square']],
            hint: 'ろっかくけい',
            difficulty: 'medium',
        },
        {
            target: '大きな三角形',
            targetShape: 'bigTriangle',
            components: ['triangle', 'triangle'],
            distractors: [['square', 'triangle'], ['circle', 'circle']],
            hint: 'おおきいさんかく',
            difficulty: 'easy',
        },
        {
            target: '矢じり',
            targetShape: 'arrow',
            components: ['triangle', 'square'],
            distractors: [['circle', 'triangle'], ['square', 'square']],
            hint: 'やじるし',
            difficulty: 'medium',
        },
        {
            target: '星',
            targetShape: 'star',
            components: ['triangle', 'triangle'],
            distractors: [['circle', 'triangle'], ['square', 'square']],
            hint: 'ほし',
            difficulty: 'easy',
        },
        {
            target: '十字',
            targetShape: 'cross',
            components: ['rect', 'rect'],
            distractors: [['triangle', 'triangle'], ['circle', 'circle']],
            hint: 'じゅうじ',
            difficulty: 'medium',
        },
        {
            target: 'T字',
            targetShape: 'tshape',
            components: ['rect', 'rect'],
            distractors: [['triangle', 'rect'], ['circle', 'rect']],
            hint: 'ティーじ',
            difficulty: 'medium',
        },
        {
            target: '並行四辺形',
            targetShape: 'parallelogram',
            components: ['triangle', 'triangle'],
            distractors: [['square', 'triangle'], ['circle', 'triangle']],
            hint: 'へいこうしへんけい',
            difficulty: 'medium',
        },
    ];

    const shapeEmojis = {
        triangle: '🔺',
        square: '🟦',
        circle: '🔴',
        rect: '▬',
        trapezoid: '⏢',
    };

    function buildUI() {
        gameContainer.textContent = '';

        const header = document.createElement('div');
        header.className = 'shape-header';

        const title = document.createElement('h2');
        title.textContent = 'ずけいパズル';

        const scoreEl = document.createElement('span');
        scoreEl.className = 'shape-score';
        scoreEl.textContent = 'スコア: 0';
        scoreEl.id = 'shape-score-display';

        header.appendChild(title);
        header.appendChild(scoreEl);
        gameContainer.appendChild(header);

        const targetArea = document.createElement('div');
        targetArea.className = 'shape-target-area';
        targetArea.id = 'shape-target';
        gameContainer.appendChild(targetArea);

        const prompt = document.createElement('p');
        prompt.className = 'shape-prompt';
        prompt.textContent = 'どのパーツでつくれる？';
        prompt.id = 'shape-prompt';
        gameContainer.appendChild(prompt);

        const choicesArea = document.createElement('div');
        choicesArea.className = 'shape-choices-area';
        choicesArea.id = 'shape-choices';
        gameContainer.appendChild(choicesArea);

        const feedbackEl = document.createElement('p');
        feedbackEl.className = 'shape-feedback';
        feedbackEl.id = 'shape-feedback';
        gameContainer.appendChild(feedbackEl);
    }

    function getAvailablePuzzles() {
        return puzzles.filter(p => difficulty === 'easy'
            ? p.difficulty === 'easy'
            : true
        );
    }

    function formatComponents(components) {
        return components.map(c => `${shapeEmojis[c] || c} ${c}`).join(' + ');
    }

    function setupNewRound() {
        const feedbackEl = document.getElementById('shape-feedback');
        feedbackEl.textContent = '';

        const available = getAvailablePuzzles();
        currentPuzzle = available[Math.floor(Math.random() * available.length)];

        const targetArea = document.getElementById('shape-target');
        targetArea.textContent = '';

        const targetName = document.createElement('div');
        targetName.className = 'shape-target-name';
        targetName.textContent = currentPuzzle.target;
        targetArea.appendChild(targetName);

        const targetHint = document.createElement('div');
        targetHint.className = 'shape-target-hint';
        targetHint.textContent = currentPuzzle.hint;
        targetArea.appendChild(targetHint);

        const correctSet = formatComponents(currentPuzzle.components);
        const wrongSets = currentPuzzle.distractors.map(d => formatComponents(d));

        const choices = [correctSet, ...wrongSets].sort(() => Math.random() - 0.5);

        const choicesArea = document.getElementById('shape-choices');
        choicesArea.textContent = '';
        choices.forEach(choiceText => {
            const btn = document.createElement('button');
            btn.className = 'shape-choice-btn';
            btn.textContent = choiceText;
            btn.addEventListener('click', () => checkAnswer(choiceText, btn));
            choicesArea.appendChild(btn);
        });
    }

    function checkAnswer(selected, buttonElement) {
        totalQuestions++;
        const correctSet = formatComponents(currentPuzzle.components);
        const feedbackEl = document.getElementById('shape-feedback');
        const isCorrect = selected === correctSet;

        if (isCorrect) {
            score++;
            buttonElement.classList.add('correct');
            feedbackEl.textContent = 'せいかい！ 🧩✨';
            feedbackEl.style.color = '#2e7d32';

            if (score >= 5 && difficulty === 'easy') {
                difficulty = 'medium';
            }
        } else {
            buttonElement.classList.add('incorrect');
            feedbackEl.textContent = `ざんねん... こたえは「${correctSet}」です 💪`;
            feedbackEl.style.color = '#c62828';
        }

        const scoreEl = document.getElementById('shape-score-display');
        scoreEl.textContent = `スコア: ${score}`;

        setTimeout(() => setupNewRound(), 1500);
    }

    buildUI();
    setupNewRound();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initShapePuzzle);
}

if (typeof module !== 'undefined') {
    module.exports = { initShapePuzzle };
}
