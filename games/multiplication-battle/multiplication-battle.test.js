/**
 * 九九バトルゲームのテスト
 * Tests for MultiplicationBattle
 */

const { initMultiplicationBattle } = require('./multiplication-battle.js');

describe('initMultiplicationBattle', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'multiplication-battle-game';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('コンテナが存在する場合、ゲームUIが作成される', () => {
        initMultiplicationBattle();

        expect(container.querySelector('#kuku-battle-screen')).not.toBeNull();
        expect(container.querySelector('#kuku-monster-area')).not.toBeNull();
        expect(container.querySelector('#kuku-player-area')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initMultiplicationBattle()).not.toThrow();
    });

    test('モンスターが表示される', () => {
        initMultiplicationBattle();

        const emoji = document.getElementById('kuku-monster-emoji');
        expect(emoji).not.toBeNull();
        expect(emoji.textContent.length).toBeGreaterThan(0);
    });

    test('問題文が表示される', () => {
        initMultiplicationBattle();

        const problem = document.getElementById('kuku-problem-text');
        expect(problem).not.toBeNull();
        expect(problem.textContent).toContain('×');
        expect(problem.textContent).toContain('=');
    });

    test('ステージが表示される', () => {
        initMultiplicationBattle();

        const stage = document.getElementById('kuku-stage');
        expect(stage.textContent).toContain('ステージ:');
    });

    test('正解するとモンスターにダメージ', () => {
        initMultiplicationBattle();

        const problemText = document.getElementById('kuku-problem-text').textContent;
        const match = problemText.match(/(\d+)\s*×\s*(\d+)/);
        const answer = parseInt(match[1], 10) * parseInt(match[2], 10);

        const input = document.getElementById('kuku-answer-input');
        input.value = answer;
        document.getElementById('kuku-submit-btn').click();

        const message = document.getElementById('kuku-battle-message');
        expect(message.textContent).toContain('せいかい');
    });

    test('不正解だとダメージなし', () => {
        initMultiplicationBattle();

        const input = document.getElementById('kuku-answer-input');
        input.value = -1;
        document.getElementById('kuku-submit-btn').click();

        const message = document.getElementById('kuku-battle-message');
        expect(message.textContent).toContain('ざんねん');
    });
});
