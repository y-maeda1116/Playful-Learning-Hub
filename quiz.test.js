import { describe, test, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
const { initQuizGame } = require('./quiz.js');

const html = fs.readFileSync(path.resolve(__dirname, './ages-1-2.html'), 'utf8');

describe('Animal Sounds Quiz with Vitest', () => {
  beforeEach(() => {
    document.body.innerHTML = html;
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    initQuizGame();
  });

  test('should display animal choices on start', () => {
    const animalChoices = document.getElementById('animal-choices');
    expect(animalChoices).not.toBeNull();
    // 4つの選択肢が表示されているか
    expect(animalChoices.children.length).toBe(4);
    // 各選択肢が絵文字を持っているか
    expect(animalChoices.textContent).toContain('🐶');
    expect(animalChoices.textContent).toContain('🐱');
    expect(animalChoices.textContent).toContain('🐘');
    expect(animalChoices.textContent).toContain('🦁');
  });

  test('should show a result message when an answer is clicked', () => {
    const resultMessage = document.getElementById('result-message');
    const animalChoices = document.getElementById('animal-choices');

    // 最初の選択肢をクリック
    const firstChoice = animalChoices.children[0];
    firstChoice.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const message = resultMessage.textContent;
    // メッセージが「せいかい！」または「ちがうよ。」のいずれかであることを確認
    expect(['せいかい！ 🎉', 'ちがうよ。もういっかい！']).toContain(message);
  });

  test('sound button should trigger an alert', () => {
    const soundButton = document.getElementById('play-sound-button');
    soundButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // alertが呼び出されたことを確認
    expect(window.alert).toHaveBeenCalledWith('（ここに動物の鳴き声が流れます）');
  });
});
