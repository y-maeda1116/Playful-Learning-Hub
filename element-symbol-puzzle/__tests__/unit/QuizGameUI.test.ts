/**
 * Unit tests for the UI component (split from UIComponents.test.ts, issue #37).
 * Test code moved unedited.
 */

import {
  MatchingGameUI,
  QuizGameUI,
  ChemicalFormulaPuzzleUI,
  PeriodicTableJigsawUI,
  ProgressTrackingUI,
  FeedbackUI,
  RewardNotificationUI,
} from '../../src/ui/UIComponents';
import { ElementContentManager } from '../../src/managers/ElementContentManager';
import { getBadgesByGrade } from '../../src/data/badges';
describe('QuizGameUI', () => {
  let mockCallback: vi.Mock;

  beforeEach(() => {
    mockCallback = vi.fn();
  });

  it('should render quiz game UI', () => {
    const manager = new ElementContentManager();
    const element = manager.getElement('H')!;
    const question = '水素の性質は何ですか？';
    const options = ['金属', '非金属', '半金属', '希ガス'];

    const ui = new QuizGameUI(element, question, options, mockCallback);
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toBe('quiz-game-ui');
    expect(rendered.querySelector('.quiz-question')).toBeDefined();
    expect(rendered.querySelector('.quiz-options')).toBeDefined();
  });

  it('should display question', () => {
    const manager = new ElementContentManager();
    const element = manager.getElement('H')!;
    const question = '水素の性質は何ですか？';
    const options = ['金属', '非金属', '半金属', '希ガス'];

    const ui = new QuizGameUI(element, question, options, mockCallback);
    const rendered = ui.render();

    const questionElement = rendered.querySelector('.quiz-question h3');
    expect(questionElement?.textContent).toBe(question);
  });

  it('should display element information', () => {
    const manager = new ElementContentManager();
    const element = manager.getElement('H')!;
    const question = '水素の性質は何ですか？';
    const options = ['金属', '非金属', '半金属', '希ガス'];

    const ui = new QuizGameUI(element, question, options, mockCallback);
    const rendered = ui.render();

    const elementInfo = rendered.querySelector('.element-info');
    expect(elementInfo?.textContent).toContain(element.symbol);
    expect(elementInfo?.textContent).toContain(element.name);
  });

  it('should display all options', () => {
    const manager = new ElementContentManager();
    const element = manager.getElement('H')!;
    const question = '水素の性質は何ですか？';
    const options = ['金属', '非金属', '半金属', '希ガス'];

    const ui = new QuizGameUI(element, question, options, mockCallback);
    const rendered = ui.render();

    const buttons = rendered.querySelectorAll('.quiz-option-button');
    expect(buttons.length).toBe(4);
  });

  it('should display correct option text', () => {
    const manager = new ElementContentManager();
    const element = manager.getElement('H')!;
    const question = '水素の性質は何ですか？';
    const options = ['金属', '非金属', '半金属', '希ガス'];

    const ui = new QuizGameUI(element, question, options, mockCallback);
    const rendered = ui.render();

    const buttons = rendered.querySelectorAll('.quiz-option-button');
    buttons.forEach((button, index) => {
      expect(button.textContent).toBe(options[index]);
    });
  });

  it('should call callback when option is selected', () => {
    const manager = new ElementContentManager();
    const element = manager.getElement('H')!;
    const question = '水素の性質は何ですか？';
    const options = ['金属', '非金属', '半金属', '希ガス'];

    const ui = new QuizGameUI(element, question, options, mockCallback);
    const rendered = ui.render();

    const firstButton = rendered.querySelector('.quiz-option-button') as HTMLButtonElement;
    firstButton.click();

    expect(mockCallback).toHaveBeenCalledWith('金属');
  });

  it('should call callback with correct option when different button is clicked', () => {
    const manager = new ElementContentManager();
    const element = manager.getElement('H')!;
    const question = '水素の性質は何ですか？';
    const options = ['金属', '非金属', '半金属', '希ガス'];

    const ui = new QuizGameUI(element, question, options, mockCallback);
    const rendered = ui.render();

    const buttons = rendered.querySelectorAll('.quiz-option-button');
    (buttons[1] as HTMLButtonElement).click();

    expect(mockCallback).toHaveBeenCalledWith('非金属');
  });

  it('should have accessible button elements', () => {
    const manager = new ElementContentManager();
    const element = manager.getElement('H')!;
    const question = '水素の性質は何ですか？';
    const options = ['金属', '非金属', '半金属', '希ガス'];

    const ui = new QuizGameUI(element, question, options, mockCallback);
    const rendered = ui.render();

    const buttons = rendered.querySelectorAll('.quiz-option-button');
    buttons.forEach((button) => {
      expect(button.tagName).toBe('BUTTON');
    });
  });

  it('should support keyboard navigation on buttons', () => {
    const manager = new ElementContentManager();
    const element = manager.getElement('H')!;
    const question = '水素の性質は何ですか？';
    const options = ['金属', '非金属', '半金属', '希ガス'];

    const ui = new QuizGameUI(element, question, options, mockCallback);
    const rendered = ui.render();

    const firstButton = rendered.querySelector('.quiz-option-button') as HTMLButtonElement;
    expect(firstButton).toBeDefined();
    
    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    firstButton.dispatchEvent(enterEvent);
    firstButton.click();

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should destroy component', () => {
    const manager = new ElementContentManager();
    const element = manager.getElement('H')!;
    const question = '水素の性質は何ですか？';
    const options = ['金属', '非金属', '半金属', '希ガス'];

    const ui = new QuizGameUI(element, question, options, mockCallback);
    const rendered = ui.render();

    expect(rendered.innerHTML).not.toBe('');
    ui.destroy();
    expect(rendered.innerHTML).toBe('');
  });
});
