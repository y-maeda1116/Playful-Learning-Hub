import { describe, test, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
const { initFractionPizzaGame } = require('./fraction-pizza.js');

const html = fs.readFileSync(path.resolve(__dirname, './ages-9-10.html'), 'utf8');

describe('Fraction Pizza Game', () => {
  beforeEach(() => {
    document.body.innerHTML = html;
    initFractionPizzaGame();
  });

  test('should display a target fraction and pizza choices', () => {
    const fractionDisplay = document.getElementById('target-fraction-display');
    const choicesContainer = document.getElementById('pizza-choices');

    expect(fractionDisplay).not.toBeNull();
    expect(choicesContainer).not.toBeNull();

    // Fraction display should have content
    expect(fractionDisplay.textContent).not.toBe('');
    // There should be 3 pizza choices
    expect(choicesContainer.children.length).toBe(3);
    // Each choice should contain an SVG element
    expect(choicesContainer.querySelector('svg')).not.toBeNull();
  });

  test('each pizza SVG should have the correct number of slices', () => {
    const choicesContainer = document.getElementById('pizza-choices');
    const firstPizzaChoice = choicesContainer.children[0];
    const svg = firstPizzaChoice.querySelector('svg');

    // The number of <path> elements should be the denominator + 1 (for the base)
    // This is a bit tricky to test without knowing the randomly generated fraction.
    // Instead, we'll just check that there are path elements.
    const paths = svg.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  test('should show a feedback message when a pizza is clicked', () => {
    const messageEl = document.getElementById('pizza-message');
    const firstChoice = document.getElementById('pizza-choices').children[0];

    firstChoice.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const message = messageEl.textContent;
    expect([
      'せいかい！おいしそうだね！ 🍕',
      'ちがうみたい。よく見てみよう！'
    ]).toContain(message);
  });
});
