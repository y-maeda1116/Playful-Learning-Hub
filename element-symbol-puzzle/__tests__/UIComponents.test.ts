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
} from '../UIComponents';
import { ElementContentManager } from '../ElementContentManager';
import { getBadgesByGrade } from '../badges';

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

  it('should display all options', () => {
    const elements = manager.getElementsByGrade(3);
    const currentElement = elements[0];
    const options = elements.slice(0, 4);

    const ui = new MatchingGameUI(currentElement, options, mockCallback);
    const element = ui.render();

    const buttons = element.querySelectorAll('.matching-option-button');
    expect(buttons.length).toBe(4);
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

  it('should display formula', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const formulaDisplay = rendered.querySelector('.formula-target');
    expect(formulaDisplay?.textContent).toBe(formula.formula);
  });

  it('should display available elements', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const buttons = rendered.querySelectorAll('.element-button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should call callback when element is selected', () => {
    const formula = manager.getFormula('H2O')!;
    const elements = manager.getElementsByGrade(5);

    const ui = new ChemicalFormulaPuzzleUI(formula, elements, mockCallback);
    const rendered = ui.render();

    const firstButton = rendered.querySelector('.element-button') as HTMLButtonElement;
    firstButton.click();

    expect(mockCallback).toHaveBeenCalled();
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

  it('should display statistics', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const statsSection = rendered.querySelector('.progress-stats');
    expect(statsSection?.textContent).toContain('75');
    expect(statsSection?.textContent).toContain('85.5');
    expect(statsSection?.textContent).toContain('5');
  });

  it('should display badges', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const badgeElements = rendered.querySelectorAll('.badge');
    expect(badgeElements.length).toBeGreaterThan(0);
  });

  it('should mark unlocked badges', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges = [badges[0].id];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const unlockedBadgeElements = rendered.querySelectorAll('.badge.unlocked');
    expect(unlockedBadgeElements.length).toBeGreaterThan(0);
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

  it('should display additional info when provided', () => {
    const ui = new FeedbackUI(true, '正解です！', '追加情報');
    const rendered = ui.render();

    expect(rendered.textContent).toContain('追加情報');
  });

  it('should not display additional info when not provided', () => {
    const ui = new FeedbackUI(true, '正解です！');
    const rendered = ui.render();

    const infoElement = rendered.querySelector('.feedback-info');
    expect(infoElement).toBeNull();
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

  it('should display badge information', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    expect(rendered.textContent).toContain(badge.name);
    expect(rendered.textContent).toContain(badge.description);
  });

  it('should display custom message', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const message = 'カスタムメッセージ';
    const ui = new RewardNotificationUI(badge, message);
    const rendered = ui.render();

    expect(rendered.textContent).toContain(message);
  });
});
