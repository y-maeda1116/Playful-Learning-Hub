/**
 * がっきたいきごう（楽器シミュレーション）
 * Instrument Simulation for ages 7-8
 *
 * ピアノ/ドラムを選んでタップし、Web Audio API の合成音で演奏する。
 * 音声アセットは不要（oscillator でその場で音を合成）。
 */

function initInstrumentSim() {
    const container = document.getElementById('instrument-sim');
    if (!container) return;

    const instruments = {
        piano: {
            name: 'ピアノ',
            icon: '🎹',
            wave: 'sine',
            pads: [
                { label: 'ド', freq: 261.63 },
                { label: 'レ', freq: 293.66 },
                { label: 'ミ', freq: 329.63 },
                { label: 'ファ', freq: 349.23 },
                { label: 'ソ', freq: 392.00 },
                { label: 'ラ', freq: 440.00 },
                { label: 'シ', freq: 493.88 },
            ],
        },
        drum: {
            name: 'ドラム',
            icon: '🥁',
            wave: 'square',
            pads: [
                { label: 'ドン', freq: 150 },
                { label: 'タ', freq: 300 },
                { label: 'チャ', freq: 500 },
                { label: 'パ', freq: 200 },
            ],
        },
    };

    let currentKey = 'piano';
    let audioCtx = null;

    function getAudioCtx() {
        if (typeof window === 'undefined') return null;
        if (!audioCtx) {
            const Ctor = window.AudioContext || window.webkitAudioContext;
            if (typeof Ctor === 'function') {
                try {
                    audioCtx = new Ctor();
                } catch (e) {
                    audioCtx = null;
                }
            }
        }
        return audioCtx;
    }

    function playNote(freq, wave) {
        const ctx = getAudioCtx();
        if (!ctx) return;
        try {
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = wave;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
            // 音声失敗は無視
        }
    }

    function buildUI() {
        container.textContent = '';

        const header = document.createElement('div');
        header.className = 'instrument-header';
        const title = document.createElement('h2');
        title.textContent = 'がっきたいきごう';
        header.appendChild(title);
        container.appendChild(header);

        const selector = document.createElement('div');
        selector.className = 'instrument-selector';
        selector.id = 'instrument-selector';
        Object.keys(instruments).forEach(function (key) {
            const btn = document.createElement('button');
            btn.className = 'instrument-select-btn' + (key === currentKey ? ' active' : '');
            btn.textContent = instruments[key].icon + ' ' + instruments[key].name;
            btn.dataset.instrument = key;
            btn.addEventListener('click', function () { selectInstrument(key); });
            selector.appendChild(btn);
        });
        container.appendChild(selector);

        const padsArea = document.createElement('div');
        padsArea.className = 'instrument-pads';
        padsArea.id = 'instrument-pads';
        container.appendChild(padsArea);

        renderPads();
    }

    function selectInstrument(key) {
        currentKey = key;
        document.querySelectorAll('.instrument-select-btn').forEach(function (b) {
            b.classList.toggle('active', b.dataset.instrument === key);
        });
        renderPads();
    }

    function renderPads() {
        const padsArea = document.getElementById('instrument-pads');
        padsArea.textContent = '';
        const inst = instruments[currentKey];
        inst.pads.forEach(function (pad) {
            const btn = document.createElement('button');
            btn.className = 'instrument-pad';
            btn.textContent = pad.label;
            btn.dataset.freq = String(pad.freq);
            btn.addEventListener('click', function () { playNote(pad.freq, inst.wave); });
            padsArea.appendChild(btn);
        });
    }

    buildUI();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initInstrumentSim);
}

if (typeof module !== 'undefined') {
    module.exports = { initInstrumentSim };
}
