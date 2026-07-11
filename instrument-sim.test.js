/**
 * がっきたいきごう（楽器シミュレーション）のテスト
 * Tests for InstrumentSim
 */

const { initInstrumentSim } = require('./instrument-sim.js');

describe('initInstrumentSim', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'instrument-sim';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.restoreAllMocks();
        delete window.AudioContext;
        delete window.webkitAudioContext;
    });

    test('コンテナが存在する場合、UIが作成される', () => {
        initInstrumentSim();

        expect(container.querySelector('.instrument-selector')).not.toBeNull();
        expect(container.querySelector('.instrument-pads')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initInstrumentSim()).not.toThrow();
    });

    test('楽器選択ボタンが2つ表示される', () => {
        initInstrumentSim();

        expect(container.querySelectorAll('.instrument-select-btn').length).toBe(2);
    });

    test('初期状態はピアノで7パッド表示', () => {
        initInstrumentSim();

        expect(container.querySelectorAll('.instrument-pad').length).toBe(7);
    });

    test('ドラムに切り替えると4パッドになる', () => {
        initInstrumentSim();

        const drumBtn = Array.from(container.querySelectorAll('.instrument-select-btn'))
            .find(b => b.dataset.instrument === 'drum');
        drumBtn.click();

        expect(container.querySelectorAll('.instrument-pad').length).toBe(4);
        expect(drumBtn.classList.contains('active')).toBe(true);
    });

    test('パッドをタップすると音が鳴る（oscillator.start 呼び出し）', () => {
        const start = vi.fn();
        const stop = vi.fn();
        window.AudioContext = function () {
            return {
                state: 'running',
                currentTime: 0,
                destination: {},
                createOscillator: () => ({
                    type: '',
                    frequency: { value: 0 },
                    connect: () => {},
                    start,
                    stop,
                }),
                createGain: () => ({
                    gain: {
                        setValueAtTime: () => {},
                        exponentialRampToValueAtTime: () => {},
                    },
                    connect: () => {},
                }),
            };
        };

        initInstrumentSim();

        const pad = container.querySelector('.instrument-pad');
        pad.click();

        expect(start).toHaveBeenCalledTimes(1);
    });

    test('AudioContext未対応でもゲームUIは作成される', () => {
        // window.AudioContext を設定しない
        initInstrumentSim();

        expect(container.querySelectorAll('.instrument-pad').length).toBe(7);
    });
});
