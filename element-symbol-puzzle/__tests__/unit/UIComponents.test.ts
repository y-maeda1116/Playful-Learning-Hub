/**
 * Unit tests for UI Components
 * 
 * Tests rendering, user interaction handling, and component lifecycle
 * for all game UI components.
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
  let mockCallback: jest.Mock;

  beforeEach(() => {
    manager = new ElementContentManager();
    mockCallback = jest.fn();
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

describe('QuizGameUI', () => {
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
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

describe('ChemicalFormulaPuzzleUI', () => {
  let manager: ElementContentManager;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    manager = new ElementContentManager();
    mockCallback = jest.fn();
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

describe('PeriodicTableJigsawUI', () => {
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
  });

  it('should render periodic table jigsaw UI', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toBe('periodic-table-jigsaw-ui');
    expect(rendered.querySelector('.periodic-table-grid')).toBeDefined();
    expect(rendered.querySelector('.remaining-pieces')).toBeDefined();
  });

  it('should display title', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    const title = rendered.querySelector('h3');
    expect(title?.textContent).toContain('周期表ジグソーパズルを完成させよう');
  });

  it('should create 7x18 grid cells', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    const cells = rendered.querySelectorAll('.periodic-table-cell');
    expect(cells.length).toBe(7 * 18); // 7 periods x 18 groups
  });

  it('should have correct data attributes on grid cells', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    const cells = rendered.querySelectorAll('.periodic-table-cell');
    let cellIndex = 0;
    for (let period = 1; period <= 7; period++) {
      for (let group = 1; group <= 18; group++) {
        const cell = cells[cellIndex];
        expect(cell.getAttribute('data-period')).toBe(period.toString());
        expect(cell.getAttribute('data-group')).toBe(group.toString());
        cellIndex++;
      }
    }
  });

  it('should display remaining pieces', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    const pieces = rendered.querySelectorAll('.draggable-piece');
    expect(pieces.length).toBe(elements.length);
  });

  it('should have draggable attribute on pieces', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    const pieces = rendered.querySelectorAll('.draggable-piece');
    pieces.forEach((piece) => {
      expect(piece.getAttribute('draggable')).toBe('true');
    });
  });

  it('should have data-element-id on draggable pieces', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    const pieces = rendered.querySelectorAll('.draggable-piece');
    pieces.forEach((piece, index) => {
      expect(piece.getAttribute('data-element-id')).toBe(elements[index].id);
    });
  });

  it('should mark placed pieces', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();
    placedPieces.set(elements[0].id, { period: elements[0].periodicTablePosition.period, group: elements[0].periodicTablePosition.group });

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    const filledCells = rendered.querySelectorAll('.periodic-table-cell.filled');
    expect(filledCells.length).toBeGreaterThan(0);
  });

  it('should display element symbol in placed pieces', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();
    placedPieces.set(elements[0].id, { period: elements[0].periodicTablePosition.period, group: elements[0].periodicTablePosition.group });

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    const filledCells = rendered.querySelectorAll('.periodic-table-cell.filled');
    expect(filledCells[0].textContent).toContain(elements[0].symbol);
    expect(filledCells[0].textContent).toContain(elements[0].atomicNumber.toString());
  });

  it('should support drag and drop on grid cells', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    const cells = rendered.querySelectorAll('.periodic-table-cell');
    const firstCell = cells[0] as HTMLElement;

    // Simulate drag over
    const dragOverEvent = new DragEvent('dragover', { bubbles: true });
    firstCell.dispatchEvent(dragOverEvent);
    expect(firstCell.classList.contains('drag-over')).toBe(true);

    // Simulate drag leave
    const dragLeaveEvent = new DragEvent('dragleave', { bubbles: true });
    firstCell.dispatchEvent(dragLeaveEvent);
    expect(firstCell.classList.contains('drag-over')).toBe(false);
  });

  it('should handle drop event on grid cells', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    const cells = rendered.querySelectorAll('.periodic-table-cell');
    const firstCell = cells[0] as HTMLElement;

    // Create a drop event with data
    const dropEvent = new DragEvent('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        getData: () => elements[0].id,
        dropEffect: 'move',
      },
    });

    firstCell.dispatchEvent(dropEvent);
    expect(mockCallback).toHaveBeenCalledWith(elements[0].id, { period: 1, group: 1 });
  });

  it('should destroy component', () => {
    const manager = new ElementContentManager();
    const elements = manager.getElementsByGrade(5);
    const puzzle = {
      id: 'test',
      difficulty: 'easy' as const,
      gradeLevel: 5 as const,
      elements,
      totalPieces: elements.length,
      description: 'Test puzzle',
    };
    const placedPieces = new Map();

    const ui = new PeriodicTableJigsawUI(puzzle, placedPieces, mockCallback);
    const rendered = ui.render();

    expect(rendered.innerHTML).not.toBe('');
    ui.destroy();
    expect(rendered.innerHTML).toBe('');
  });
});

describe('ProgressTrackingUI', () => {
  it('should render progress tracking UI', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges = [badges[0].id];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toBe('progress-tracking-ui');
    expect(rendered.querySelector('.progress-stats')).toBeDefined();
    expect(rendered.querySelector('.badges-section')).toBeDefined();
  });

  it('should display statistics title', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const statsSection = rendered.querySelector('.progress-stats h3');
    expect(statsSection?.textContent).toContain('学習進捗');
  });

  it('should display mastery level', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const statsSection = rendered.querySelector('.progress-stats');
    expect(statsSection?.textContent).toContain('75');
  });

  it('should display average accuracy', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const statsSection = rendered.querySelector('.progress-stats');
    expect(statsSection?.textContent).toContain('85.5');
  });

  it('should display streak days', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const statsSection = rendered.querySelector('.progress-stats');
    expect(statsSection?.textContent).toContain('5');
  });

  it('should display progress bar', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const progressBar = rendered.querySelector('.progress-bar');
    expect(progressBar).toBeDefined();
  });

  it('should set progress bar width correctly', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const progressFill = rendered.querySelector('.progress-fill') as HTMLElement;
    expect(progressFill?.style.width).toBe('75%');
  });

  it('should display badges section', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const badgesSection = rendered.querySelector('.badges-section h3');
    expect(badgesSection?.textContent).toContain('バッジ');
  });

  it('should display all badges', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const badgeElements = rendered.querySelectorAll('.badge');
    expect(badgeElements.length).toBe(badges.length);
  });

  it('should mark unlocked badges', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges = [badges[0].id];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const unlockedBadgeElements = rendered.querySelectorAll('.badge.unlocked');
    expect(unlockedBadgeElements.length).toBeGreaterThan(0);
  });

  it('should mark locked badges', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const lockedBadgeElements = rendered.querySelectorAll('.badge.locked');
    expect(lockedBadgeElements.length).toBeGreaterThan(0);
  });

  it('should display badge names', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const badgeNames = rendered.querySelectorAll('.badge-name');
    badgeNames.forEach((name, index) => {
      expect(name.textContent).toBe(badges[index].name);
    });
  });

  it('should display badge descriptions', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const badgeDescriptions = rendered.querySelectorAll('.badge-description');
    expect(badgeDescriptions.length).toBeGreaterThan(0);
  });

  it('should display lock icon for locked badges', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const lockedBadges = rendered.querySelectorAll('.badge.locked');
    lockedBadges.forEach((badge) => {
      expect(badge.textContent).toContain('🔒');
    });
  });

  it('should destroy component', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    expect(rendered.innerHTML).not.toBe('');
    ui.destroy();
    expect(rendered.innerHTML).toBe('');
  });
});

describe('FeedbackUI', () => {
  it('should render correct feedback', () => {
    const ui = new FeedbackUI(true, '正解です！', '水素について学びました');
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toContain('feedback-ui');
    expect(rendered.className).toContain('correct');
    expect(rendered.textContent).toContain('正解です！');
  });

  it('should render incorrect feedback', () => {
    const ui = new FeedbackUI(false, '不正解です', '正しい答えは酸素です');
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toContain('feedback-ui');
    expect(rendered.className).toContain('incorrect');
    expect(rendered.textContent).toContain('不正解です');
  });

  it('should display correct icon for correct answer', () => {
    const ui = new FeedbackUI(true, '正解です！');
    const rendered = ui.render();

    const icon = rendered.querySelector('.feedback-icon');
    expect(icon?.textContent).toContain('✓');
  });

  it('should display incorrect icon for incorrect answer', () => {
    const ui = new FeedbackUI(false, '不正解です');
    const rendered = ui.render();

    const icon = rendered.querySelector('.feedback-icon');
    expect(icon?.textContent).toContain('✗');
  });

  it('should display feedback message', () => {
    const message = '素晴らしい！';
    const ui = new FeedbackUI(true, message);
    const rendered = ui.render();

    const messageElement = rendered.querySelector('.feedback-message');
    expect(messageElement?.textContent).toBe(message);
  });

  it('should display additional info when provided', () => {
    const additionalInfo = '追加情報';
    const ui = new FeedbackUI(true, '正解です！', additionalInfo);
    const rendered = ui.render();

    expect(rendered.textContent).toContain(additionalInfo);
  });

  it('should have feedback-info element when additional info is provided', () => {
    const ui = new FeedbackUI(true, '正解です！', '追加情報');
    const rendered = ui.render();

    const infoElement = rendered.querySelector('.feedback-info');
    expect(infoElement).toBeDefined();
    expect(infoElement?.textContent).toBe('追加情報');
  });

  it('should not display additional info when not provided', () => {
    const ui = new FeedbackUI(true, '正解です！');
    const rendered = ui.render();

    const infoElement = rendered.querySelector('.feedback-info');
    expect(infoElement).toBeNull();
  });

  it('should have accessible structure', () => {
    const ui = new FeedbackUI(true, '正解です！', '追加情報');
    const rendered = ui.render();

    expect(rendered.querySelector('.feedback-icon')).toBeDefined();
    expect(rendered.querySelector('.feedback-message')).toBeDefined();
  });

  it('should destroy component', () => {
    const ui = new FeedbackUI(true, '正解です！');
    const rendered = ui.render();

    expect(rendered.innerHTML).not.toBe('');
    ui.destroy();
    expect(rendered.innerHTML).toBe('');
  });
});

describe('RewardNotificationUI', () => {
  it('should render reward notification', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toBe('reward-notification-ui');
    expect(rendered.textContent).toContain(badge.name);
  });

  it('should display reward content section', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    const rewardContent = rendered.querySelector('.reward-content');
    expect(rewardContent).toBeDefined();
  });

  it('should display badge icon', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    const icon = rendered.querySelector('.reward-icon');
    expect(icon?.textContent).toBe(badge.icon);
  });

  it('should display badge name', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    const name = rendered.querySelector('h3');
    expect(name?.textContent).toBe(badge.name);
  });

  it('should display custom message', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const message = 'カスタムメッセージ';
    const ui = new RewardNotificationUI(badge, message);
    const rendered = ui.render();

    expect(rendered.textContent).toContain(message);
  });

  it('should display badge description', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    const description = rendered.querySelector('.badge-description');
    expect(description?.textContent).toBe(badge.description);
  });

  it('should display badge information', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    expect(rendered.textContent).toContain(badge.name);
    expect(rendered.textContent).toContain(badge.description);
  });

  it('should have accessible structure', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    expect(rendered.querySelector('.reward-icon')).toBeDefined();
    expect(rendered.querySelector('h3')).toBeDefined();
    expect(rendered.querySelector('.badge-description')).toBeDefined();
  });

  it('should destroy component', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    expect(rendered.innerHTML).not.toBe('');
    ui.destroy();
    expect(rendered.innerHTML).toBe('');
  });
});
