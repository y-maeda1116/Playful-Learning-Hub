document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('fraction-pizza-game');

    const possibleFractions = [
        { n: 1, d: 2 }, { n: 1, d: 3 }, { n: 2, d: 3 },
        { n: 1, d: 4 }, { n: 3, d: 4 }, { n: 1, d: 5 },
        { n: 2, d: 5 }, { n: 3, d: 5 }, { n: 4, d: 5 },
        { n: 1, d: 6 }, { n: 5, d: 6 }, { n: 1, d: 8 },
        { n: 3, d: 8 }, { n: 5, d: 8 }, { n: 7, d: 8 },
    ];

    let correctFraction = null;

    function createPizzaSVG(numerator, denominator, size = 150) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

        const center = size / 2;
        const radius = size / 2 - 5;

        // Pizza base
        const base = document.createElementNS(svgNS, "circle");
        base.setAttribute("cx", center);
        base.setAttribute("cy", center);
        base.setAttribute("r", radius);
        base.setAttribute("fill", "#ffdd99"); // Crust color
        base.setAttribute("stroke", "#e6a84f");
        base.setAttribute("stroke-width", "5");
        svg.appendChild(base);

        // Slices
        const angleStep = 360 / denominator;
        for (let i = 0; i < denominator; i++) {
            const startAngle = i * angleStep;
            const endAngle = (i + 1) * angleStep;

            const start = polarToCartesian(center, center, radius, endAngle);
            const end = polarToCartesian(center, center, radius, startAngle);

            const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

            const d = [
                "M", center, center,
                "L", start.x, start.y,
                "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
                "Z"
            ].join(" ");

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", d);

            if (i < numerator) {
                path.setAttribute("fill", "#d43a3a"); // Topping color
            } else {
                path.setAttribute("fill", "#f5d061"); // Cheese color
            }
            path.setAttribute("stroke", "#e6a84f");
            path.setAttribute("stroke-width", "2");
            svg.appendChild(path);
        }

        return svg;
    }

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    function startGame() {
        gameContainer.innerHTML = `
            <h2 id="pizza-question">この分数はどーれだ？</h2>
            <div id="target-fraction-display"></div>
            <div id="pizza-choices"></div>
            <p id="pizza-message"></p>
        `;
        setupNewRound();
    }

    function setupNewRound() {
        const fractionDisplay = document.getElementById('target-fraction-display');
        const choicesContainer = document.getElementById('pizza-choices');
        const messageEl = document.getElementById('pizza-message');

        messageEl.textContent = '';
        choicesContainer.innerHTML = '';

        // Generate a set of unique fractions for choices
        let choices = [];
        let tempFractions = [...possibleFractions];
        for (let i = 0; i < 3; i++) {
            const randIndex = Math.floor(Math.random() * tempFractions.length);
            choices.push(tempFractions.splice(randIndex, 1)[0]);
        }
        correctFraction = choices[Math.floor(Math.random() * choices.length)];

        fractionDisplay.innerHTML = `<span class="frac"><sup>${correctFraction.n}</sup><span>&frasl;</span><sub>${correctFraction.d}</sub></span>`;

        // Display pizza choices
        choices.forEach(frac => {
            const pizzaChoice = document.createElement('div');
            pizzaChoice.classList.add('pizza-choice');
            const pizzaSVG = createPizzaSVG(frac.n, frac.d);
            pizzaChoice.appendChild(pizzaSVG);
            pizzaChoice.addEventListener('click', () => checkAnswer(frac));
            choicesContainer.appendChild(pizzaChoice);
        });
    }

    function checkAnswer(selectedFraction) {
        const messageEl = document.getElementById('pizza-message');
        if (selectedFraction.n === correctFraction.n && selectedFraction.d === correctFraction.d) {
            messageEl.textContent = 'せいかい！おいしそうだね！ 🍕';
            setTimeout(setupNewRound, 2000);
        } else {
            messageEl.textContent = 'ちがうみたい。よく見てみよう！';
        }
    }

    startGame();
});
