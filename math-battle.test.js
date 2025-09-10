import { describe, test, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, './ages-7-8.html'), 'utf8');

describe('Math Battle Game', () => {
  beforeEach(async () => {
    document.body.innerHTML = html;
    await import('./math-battle.js');
  });

  test('should display a monster and a problem on start', () => {
    const monsterEmoji = document.getElementById('monster-emoji');
    const problemText = document.getElementById('problem-text');

    expect(monsterEmoji).not.toBeNull();
    expect(problemText).not.toBeNull();

    // Monster should be one of the possible emojis
    const monsters = ['👹', '👻', '👾', '👽', '💀', '👺'];
    expect(monsters).toContain(monsterEmoji.textContent);

    // Problem text should contain a math expression
    expect(problemText.textContent).toMatch(/.+ [+\-] .+ = \?/);
  });

  test('should show a feedback message when an answer is submitted', () => {
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-answer-btn');
    const battleMessageEl = document.getElementById('battle-message');

    // Enter a dummy answer
    answerInput.value = '10';
    submitButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const message = battleMessageEl.textContent;
    expect([
      'せいかい！モンスターに１のダメージ！',
      'ざんねん、こうげきがはずれた！もういちど！'
    ]).toContain(message);
  });
});
