/**
 * 時計学習ゲーム
 * Clock Learning Game for ages 5-8
 */

function initClockGame() {
    const gameContainer = document.getElementById('clock-game');
    if (!gameContainer) return;

    let currentAnswer = null;
    let difficulty = 1;
    let score = 0;
    let totalQuestions = 0;
    let correctInLevel = 0;

    const difficultyConfig = {
        1: { minuteStep: 60, label: 'じちょうど' },
        2: { minuteStep: 30, label: 'はん' },
        3: { minuteStep: 15, label: '15ふん単位' },
        4: { minuteStep: 5, label: '5ふん単位' },
    };

    function createClockSVG(hours, minutes, size) {
        const svgSize = size || 220;
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', svgSize);
        svg.setAttribute('height', svgSize);
        svg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);

        const cx = svgSize / 2;
        const cy = svgSize / 2;
        const radius = svgSize / 2 - 10;

        // Clock face
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '3');
        svg.appendChild(circle);

        // Hour marks and numbers
        for (let i = 1; i <= 12; i++) {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const innerR = radius - 20;
            const outerR = radius - 5;

            const tick = document.createElementNS(svgNS, 'line');
            tick.setAttribute('x1', cx + innerR * Math.cos(angle));
            tick.setAttribute('y1', cy + innerR * Math.sin(angle));
            tick.setAttribute('x2', cx + outerR * Math.cos(angle));
            tick.setAttribute('y2', cy + outerR * Math.sin(angle));
            tick.setAttribute('stroke', '#333');
            tick.setAttribute('stroke-width', '2');
            svg.appendChild(tick);

            const numR = radius - 35;
            const num = document.createElementNS(svgNS, 'text');
            num.setAttribute('x', cx + numR * Math.cos(angle));
            num.setAttribute('y', cy + numR * Math.sin(angle));
            num.setAttribute('text-anchor', 'middle');
            num.setAttribute('dominant-baseline', 'central');
            num.setAttribute('font-size', '16');
            num.setAttribute('font-weight', 'bold');
            num.textContent = i.toString();
            svg.appendChild(num);
        }

        // Hour hand
        const hourAngle = ((hours % 12) * 30 + minutes * 0.5 - 90) * (Math.PI / 180);
        const hourLength = radius * 0.5;
        const hourHand = document.createElementNS(svgNS, 'line');
        hourHand.setAttribute('x1', cx);
        hourHand.setAttribute('y1', cy);
        hourHand.setAttribute('x2', cx + hourLength * Math.cos(hourAngle));
        hourHand.setAttribute('y2', cy + hourLength * Math.sin(hourAngle));
        hourHand.setAttribute('stroke', '#333');
        hourHand.setAttribute('stroke-width', '4');
        hourHand.setAttribute('stroke-linecap', 'round');
        svg.appendChild(hourHand);

        // Minute hand
        const minAngle = (minutes * 6 - 90) * (Math.PI / 180);
        const minLength = radius * 0.7;
        const minHand = document.createElementNS(svgNS, 'line');
        minHand.setAttribute('x1', cx);
        minHand.setAttribute('y1', cy);
        minHand.setAttribute('x2', cx + minLength * Math.cos(minAngle));
        minHand.setAttribute('y2', cy + minLength * Math.sin(minAngle));
        minHand.setAttribute('stroke', '#1565c0');
        minHand.setAttribute('stroke-width', '3');
        minHand.setAttribute('stroke-linecap', 'round');
        svg.appendChild(minHand);

        // Center dot
        const dot = document.createElementNS(svgNS, 'circle');
        dot.setAttribute('cx', cx);
        dot.setAttribute('cy', cy);
        dot.setAttribute('r', '5');
        dot.setAttribute('fill', '#333');
        svg.appendChild(dot);

        return svg;
    }

    function formatTime(hours, minutes) {
        const m = minutes.toString().padStart(2, '0');
        return `${hours}:${m}`;
    }

    function buildUI() {
        gameContainer.textContent = '';

        const header = document.createElement('div');
        header.className = 'clock-header';

        const title = document.createElement('h2');
        title.textContent = 'とけいあそび';

        const scoreEl = document.createElement('span');
        scoreEl.className = 'clock-score';
        scoreEl.textContent = 'スコア: 0';
        scoreEl.id = 'clock-score-display';

        const diffEl = document.createElement('span');
        diffEl.className = 'clock-difficulty';
        diffEl.textContent = difficultyConfig[difficulty].label;
        diffEl.id = 'clock-difficulty-display';

        header.appendChild(title);
        header.appendChild(scoreEl);
        header.appendChild(diffEl);
        gameContainer.appendChild(header);

        const clockArea = document.createElement('div');
        clockArea.className = 'clock-display-area';
        clockArea.id = 'clock-display';
        gameContainer.appendChild(clockArea);

        const prompt = document.createElement('p');
        prompt.className = 'clock-prompt';
        prompt.textContent = 'このとけいの時刻は？';
        gameContainer.appendChild(prompt);

        const choicesArea = document.createElement('div');
        choicesArea.className = 'clock-choices-area';
        choicesArea.id = 'clock-choices';
        gameContainer.appendChild(choicesArea);

        const feedbackEl = document.createElement('p');
        feedbackEl.className = 'clock-feedback';
        feedbackEl.id = 'clock-feedback';
        gameContainer.appendChild(feedbackEl);
    }

    function setupNewRound() {
        const feedbackEl = document.getElementById('clock-feedback');
        feedbackEl.textContent = '';

        const config = difficultyConfig[difficulty];
        const hours = Math.floor(Math.random() * 12) + 1;
        const maxSlots = Math.floor(60 / config.minuteStep);
        const minutes = Math.floor(Math.random() * maxSlots) * config.minuteStep;
        currentAnswer = { hours, minutes };

        const clockArea = document.getElementById('clock-display');
        clockArea.textContent = '';
        clockArea.appendChild(createClockSVG(hours, minutes, 220));

        const correctTime = formatTime(hours, minutes);
        const distractors = [];
        while (distractors.length < 3) {
            const dH = Math.floor(Math.random() * 12) + 1;
            const dM = Math.floor(Math.random() * maxSlots) * config.minuteStep;
            const dTime = formatTime(dH, dM);
            if (dTime !== correctTime && !distractors.includes(dTime)) {
                distractors.push(dTime);
            }
        }

        const choices = [correctTime, ...distractors].sort(() => Math.random() - 0.5);

        const choicesArea = document.getElementById('clock-choices');
        choicesArea.textContent = '';
        choices.forEach(time => {
            const btn = document.createElement('button');
            btn.className = 'clock-choice-btn';
            btn.textContent = time;
            btn.addEventListener('click', () => checkAnswer(time, btn));
            choicesArea.appendChild(btn);
        });
    }

    function checkAnswer(selected, buttonElement) {
        totalQuestions++;
        const correctTime = formatTime(currentAnswer.hours, currentAnswer.minutes);
        const feedbackEl = document.getElementById('clock-feedback');
        const isCorrect = selected === correctTime;

        if (isCorrect) {
            score++;
            correctInLevel++;
            buttonElement.classList.add('correct');
            feedbackEl.textContent = 'せいかい！ ⏰✨';
            feedbackEl.style.color = '#2e7d32';

            if (correctInLevel >= 4 && difficulty < 4) {
                difficulty++;
                correctInLevel = 0;
                const diffEl = document.getElementById('clock-difficulty-display');
                diffEl.textContent = difficultyConfig[difficulty].label;
            }
        } else {
            buttonElement.classList.add('incorrect');
            feedbackEl.textContent = `ざんねん... こたえは ${correctTime} です 💪`;
            feedbackEl.style.color = '#c62828';
        }

        const scoreEl = document.getElementById('clock-score-display');
        scoreEl.textContent = `スコア: ${score}`;

        setTimeout(() => setupNewRound(), 1500);
    }

    buildUI();
    setupNewRound();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initClockGame);
}

if (typeof module !== 'undefined') {
    module.exports = { initClockGame };
}
