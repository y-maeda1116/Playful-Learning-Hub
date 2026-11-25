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
describe('ChemicalFormulaPuzzleUI', () => {
  let manager: ElementContentManager;
  let mockCallback: vi.Mock;

  beforeEach(() => {
    manager = new ElementContentManager();
    mockCallback = vi.fn();
  });

  it('should render chemical formula puzzle UI', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toBe('chemical-formula-puzzle-ui');
    expect(rendered.querySelector('.formula-display')).toBeDefined();
    expect(rendered.querySelector('.formula-elements')).toBeDefined();
  });

  it('should display formula title', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const title = rendered.querySelector('.formula-display h3');
    expect(title?.textContent).toContain('化学式を完成させよう');
  });

  it('should display formula', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const formulaDisplay = rendered.querySelector('.formula-target');
    expect(formulaDisplay?.textContent).toBe(formula.formula);
  });

  it('should display formula name', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const formulaName = rendered.querySelector('.formula-name');
    expect(formulaName?.textContent).toContain(formula.name);
  });

  it('should display formula uses', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const formulaUses = rendered.querySelector('.formula-uses');
    expect(formulaUses?.textContent).toContain('用途');
  });

  it('should display available elements', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const buttons = rendered.querySelectorAll('.element-button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should display correct element symbols', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const buttons = rendered.querySelectorAll('.element-button');
    buttons.forEach((button, index) => {
      expect(button.textContent).toBe(elements[index].symbol);
    });
  });

  it('should call callback when element is selected', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const firstButton = rendered.querySelector('.element-button') as HTMLButtonElement;
    firstButton.click();

    expect(mockCallback).toHaveBeenCalledWith(elements[0].symbol);
  });

  it('should call callback with correct element when different button is clicked', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const buttons = rendered.querySelectorAll('.element-button');
    (buttons[2] as HTMLButtonElement).click();

    expect(mockCallback).toHaveBeenCalledWith(elements[2].symbol);
  });

  it('should have data-element-id attribute on buttons', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const buttons = rendered.querySelectorAll('.element-button');
    buttons.forEach((button, index) => {
      expect(button.getAttribute('data-element-id')).toBe(elements[index].id);
    });
  });

  it('should have accessible button elements', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const buttons = rendered.querySelectorAll('.element-button');
    buttons.forEach((button) => {
      expect(button.tagName).toBe('BUTTON');
    });
  });

  it('should support keyboard navigation on buttons', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const firstButton = rendered.querySelector('.element-button') as HTMLButtonElement;
    expect(firstButton).toBeDefined();
    
    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    firstButton.dispatchEvent(enterEvent);
    firstButton.click();

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should destroy component', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    expect(rendered.innerHTML).not.toBe('');
    ui.destroy();
    expect(rendered.innerHTML).toBe('');
  });
});
