import { describe, test, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
const { initSpeedGame } = require('./speed-game.js');

const html = fs.readFileSync(path.resolve(__dirname, './ages-11-12.html'), 'utf8');

describe('Speed Calculation Game', () => {
  beforeEach(() => {
    document.body.innerHTML = html;
    initSpeedGame();
  });

  test('should display a word problem and answer section', () => {
    const problemText = document.getElementById('problem-text');
    const answerInput = document.getElementById('player-answer');
    const answerUnit = document.getElementById('answer-unit');

    expect(problemText).not.toBeNull();
    expect(answerInput).not.toBeNull();
    expect(answerUnit).not.toBeNull();

    // Problem should contain some text
    expect(problemText.textContent.length).toBeGreaterThan(10);
    // Unit should be one of the expected units
    expect(['km', 'km/h', '時間']).toContain(answerUnit.textContent);
  });

  test('should show a feedback message when an answer is submitted', () => {
    const answerInput = document.getElementById('player-answer');
    const submitButton = document.getElementById('submit-btn');
    const feedbackEl = document.getElementById('feedback-message');

    answerInput.value = '100'; // Dummy answer
    submitButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(feedbackEl.textContent).not.toBe('');
  });
});
