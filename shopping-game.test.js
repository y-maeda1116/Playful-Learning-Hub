import { describe, test, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, './ages-5-6.html'), 'utf8');

describe('Shopping Game', () => {
  beforeEach(async () => {
    document.body.innerHTML = html;
    await import('./shopping-game.js');
  });

  test('should display target amount and shop items', () => {
    const targetAmountEl = document.getElementById('target-amount');
    const itemShelfEl = document.getElementById('item-shelf');

    expect(targetAmountEl).not.toBeNull();
    expect(itemShelfEl).not.toBeNull();

    // Target amount should be a number ending with "円"
    expect(targetAmountEl.textContent).toMatch(/\d+円/);
    // There should be 6 items on the shelf
    expect(itemShelfEl.children.length).toBe(6);
  });

  test('should update cart and total when an item is clicked', () => {
    const firstItem = document.getElementById('item-shelf').children[0];
    const cartItemsEl = document.getElementById('cart-items');
    const currentTotalEl = document.getElementById('current-total');

    // Price of the first item is 10
    const itemPrice = 10;

    firstItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Cart should have one item
    expect(cartItemsEl.children.length).toBe(1);
    // Total should be the price of the first item
    expect(currentTotalEl.textContent).toBe(String(itemPrice));
  });

  test('should show a feedback message when checking the answer', () => {
    const checkButton = document.getElementById('check-answer-btn');
    const gameMessageEl = document.getElementById('game-message');

    checkButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // A message should appear (it will likely be the "wrong" message initially)
    expect(gameMessageEl.textContent).not.toBe('');
  });
});
