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
describe('MatchingGameUI', () => {
  let manager: ElementContentManager;
  let mockCallback: vi.Mock;

  beforeEach(() => {
    manager = new ElementContentManager();
    mockCallback = vi.fn();
  });

  it('should render matching game UI', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    expect(element).toBeDefined();
    expect(element.className).toBe('matching-game-ui');
    expect(element.querySelector('.element-symbol')).toBeDefined();
    expect(element.querySelector('.matching-options')).toBeDefined();
  });

  it('should display element symbol', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    const symbolElement = element.querySelector('.element-symbol');
    expect(symbolElement?.textContent).toBe(currentElement.symbol);
  });

  it('should display atomic number', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    const atomicNumberElement = element.querySelector('.element-atomic-number');
    expect(atomicNumberElement?.textContent).toContain(currentElement.atomicNumber.toString());
  });

  it('should display all options', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    const buttons = element.querySelectorAll('.matching-option-button');
    expect(buttons.length).toBe(4);
  });

  it('should display correct option names', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    const buttons = element.querySelectorAll('.matching-option-button');
    buttons.forEach((button, index) => {
      expect(button.textContent).toBe(options[index].name);
    });
  });

  it('should call callback when option is selected', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    const firstButton = element.querySelector('.matching-option-button') as HTMLButtonElement;
    firstButton.click();

    expect(mockCallback).toHaveBeenCalledWith(options[0].name);
  });

  it('should call callback with correct option when different button is clicked', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    const buttons = element.querySelectorAll('.matching-option-button');
    (buttons[2] as HTMLButtonElement).click();

    expect(mockCallback).toHaveBeenCalledWith(options[2].name);
  });

  it('should have data-element-id attribute on buttons', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    const buttons = element.querySelectorAll('.matching-option-button');
    buttons.forEach((button, index) => {
      expect(button.getAttribute('data-element-id')).toBe(options[index].id);
    });
  });

  it('should have accessible button elements', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    const buttons = element.querySelectorAll('.matching-option-button');
    buttons.forEach((button) => {
      expect(button.tagName).toBe('BUTTON');
    });
  });

  it('should support keyboard navigation on buttons', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    const firstButton = element.querySelector('.matching-option-button') as HTMLButtonElement;
    expect(firstButton).toBeDefined();
    
    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    firstButton.dispatchEvent(enterEvent);
    firstButton.click();

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should destroy component', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    expect(element.innerHTML).not.toBe('');
    ui.destroy();
    expect(element.innerHTML).toBe('');
  });
});
