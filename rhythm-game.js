/**
 * リズムゲーム
 * Rhythm Game (Simon Says) for ages 1-4
 */

function initRhythmGame() {
    const gameContainer = document.getElementById('rhythm-game');
    if (!gameContainer) return;

    const buttons = [
        { color: '#ff6b6b', name: 'あか', tone: 261.63 },
        { color: '#4ecdc4', name: 'あお', tone: 329.63 },
        { color: '#66bb6a', name: 'みどり', tone: 392.00 },
        { color: '#f9ca24', name: 'きいろ', tone: 523.25 },
    ];

    let pattern = [];
    let playerIndex = 0;
    let isPlayingPattern = false;
    let score = 0;
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) {
                audioCtx = new AC();
            }
        }
        return audioCtx;
    }

    function playTone(frequency) {
        const ctx = getAudioContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    }

    function buildUI() {
        gameContainer.textContent = '';

        const header = document.createElement('div');
        header.className = 'rhythm-header';

        const title = document.createElement('h2');
        title.textContent = 'おとをおぼえよう！';

        const scoreEl = document.createElement('span');
        scoreEl.className = 'rhythm-score';
        scoreEl.textContent = 'スコア: 0';
        scoreEl.id = 'rhythm-score-display';

        header.appendChild(title);
        header.appendChild(scoreEl);
        gameContainer.appendChild(header);

        const messageEl = document.createElement('p');
        messageEl.className = 'rhythm-message';
        messageEl.id = 'rhythm-message';
        messageEl.textContent = 'まってね...';
        gameContainer.appendChild(messageEl);

        const buttonsArea = document.createElement('div');
        buttonsArea.className = 'rhythm-buttons-area';
        buttonsArea.id = 'rhythm-buttons';

        buttons.forEach((btn, i) => {
            const el = document.createElement('button');
            el.className = 'rhythm-button';
            el.dataset.index = i;
            el.style.backgroundColor = btn.color;
            el.setAttribute('aria-label', btn.name);
            el.addEventListener('click', () => handlePlayerInput(i));
            buttonsArea.appendChild(el);
        });

        gameContainer.appendChild(buttonsArea);
    }

    function highlightButton(index, duration) {
        const btns = document.querySelectorAll('.rhythm-button');
        if (btns[index]) {
            btns[index].classList.add('lit');
            setTimeout(() => btns[index].classList.remove('lit'), duration || 400);
        }
    }

    function addToPattern() {
        pattern.push(Math.floor(Math.random() * 4));
    }

    function playPattern() {
        isPlayingPattern = true;
        const messageEl = document.getElementById('rhythm-message');
        messageEl.textContent = 'よくみてね！';

        let i = 0;
        const interval = setInterval(() => {
            if (i >= pattern.length) {
                clearInterval(interval);
                isPlayingPattern = false;
                messageEl.textContent = 'じゅんばんにタップしてね！';
                return;
            }

            const idx = pattern[i];
            playTone(buttons[idx].tone);
            highlightButton(idx);
            i++;
        }, 700);
    }

    function handlePlayerInput(buttonIndex) {
        if (isPlayingPattern) return;

        playTone(buttons[buttonIndex].tone);
        highlightButton(buttonIndex, 200);

        const messageEl = document.getElementById('rhythm-message');

        if (buttonIndex === pattern[playerIndex]) {
            playerIndex++;

            if (playerIndex === pattern.length) {
                score++;
                playerIndex = 0;
                messageEl.textContent = 'せいかい！ 🎵';

                const scoreEl = document.getElementById('rhythm-score-display');
                scoreEl.textContent = `スコア: ${score}`;

                addToPattern();
                setTimeout(() => playPattern(), 1000);
            }
        } else {
            messageEl.textContent = 'もういちど！ 😊';
            playerIndex = 0;
            pattern = [];
            addToPattern();
            addToPattern();
            setTimeout(() => playPattern(), 1500);
        }
    }

    buildUI();
    addToPattern();
    addToPattern();
    setTimeout(() => playPattern(), 500);
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initRhythmGame);
}

if (typeof module !== 'undefined') {
    module.exports = { initRhythmGame };
}
