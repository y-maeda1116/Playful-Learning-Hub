import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
const { initBiologyQuiz } = require('./biology-quiz.js');

const html = fs.readFileSync(path.resolve(__dirname, './ages-5-6.html'), 'utf8');

describe('Biology Quiz', () => {
  beforeEach(() => {
    document.body.innerHTML = html;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should display quiz choices on start', () => {
    initBiologyQuiz();
    const quizChoices = document.getElementById('quiz-choices');
    expect(quizChoices).not.toBeNull();
    expect(quizChoices.children.length).toBe(3);
  });

  test('should show a result message when an answer is clicked', () => {
    initBiologyQuiz();
    const resultMessage = document.getElementById('quiz-result');
    const quizChoices = document.getElementById('quiz-choices');

    const firstChoice = quizChoices.children[0];
    firstChoice.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const message = resultMessage.textContent;
    expect(['せいかい！ 🎉', 'ちがうよ。もういっかい！']).toContain(message);
  });

  test('should load a new question after a correct answer and apply animation', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // Always selects the first question (lion)
    initBiologyQuiz();

    vi.useFakeTimers();
    const resultMessage = document.getElementById('quiz-result');
    const quizChoices = document.getElementById('quiz-choices');
    const imageElement = document.getElementById('quiz-image');

    const originalImageSrc = imageElement.src;
    expect(originalImageSrc).toContain('images/lion.jpg');

    let correctButton;
    for (const button of quizChoices.children) {
      if (button.textContent === 'ライオン') {
        correctButton = button;
        break;
      }
    }

    expect(correctButton).toBeDefined();
    correctButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(resultMessage.textContent).toBe('せいかい！ 🎉');
    expect(imageElement.classList.contains('correct-answer-animation')).toBe(true);

    // Set up mock for the next question load
    vi.mocked(Math.random).mockReturnValue(0.5); // Will select the third question (whale)

    vi.runAllTimers();

    const newImageSrc = imageElement.src;
    expect(newImageSrc).toContain('images/whale.jpg');
    expect(newImageSrc).not.toBe(originalImageSrc);
    expect(imageElement.classList.contains('correct-answer-animation')).toBe(false);


    vi.useRealTimers();
  });

  test('sound button should trigger an alert for questions with sound', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(Math, 'random').mockReturnValue(0); // Lion question (with sound)
    initBiologyQuiz();

    const soundButton = document.getElementById('play-quiz-sound-button');
    expect(soundButton.style.display).toBe('inline-block');
    soundButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(window.alert).toHaveBeenCalledWith('（ここにライオンの鳴き声が流れます）');
  });

  test('sound button should be hidden for questions without sound', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.4); // Rose question (no sound)
    initBiologyQuiz();

    const soundButton = document.getElementById('play-quiz-sound-button');
    expect(soundButton.style.display).toBe('none');
  });
});
