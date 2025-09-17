import { describe, test, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
const { initClassificationGame } = require('./classification-game.js');

// HTMLファイルの読み込み
const html = fs.readFileSync(path.resolve(__dirname, './ages-3-4.html'), 'utf8');

describe('Classification Game', () => {
  beforeEach(() => {
    // JSDOMのセットアップ
    document.body.innerHTML = html;
    // ゲームの初期化
    initClassificationGame();
  });

  test('should display a question and choices on start', () => {
    const questionElement = document.getElementById('game-question');
    const choicesContainer = document.getElementById('item-choices');

    expect(questionElement).not.toBeNull();
    expect(choicesContainer).not.toBeNull();

    // Check that a question text is present
    expect(questionElement.textContent).toContain('はどれかな？');
    // Check that 4 choices are displayed
    expect(choicesContainer.children.length).toBe(4);
  });

  test('should display a result message when a choice is clicked', () => {
    const resultElement = document.getElementById('game-result');
    const firstChoice = document.getElementById('item-choices').children[0];

    firstChoice.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const message = resultElement.textContent;
    expect([
      'せいかい！よくできたね！ 🎉',
      'ちがうみたい。もういちどさがしてみよう！'
    ]).toContain(message);
  });
});
