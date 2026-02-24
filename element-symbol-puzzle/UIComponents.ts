/**
 * UI Components for Element Symbol Puzzle
 * 
 * Provides React-like component interfaces and rendering logic for all game modes.
 * Supports matching, quiz, chemical formula, and periodic table jigsaw games.
 */

import { Element, GameSession, ChemicalFormula, PeriodicTablePuzzle, Badge } from './types';

/**
 * Callback function for user selections
 */
export type SelectionCallback = (value: string) => void;

/**
 * Callback function for drag and drop operations
 */
export type DragDropCallback = (elementId: string, position: { period: number; group: number }) => void;

/**
 * Base UI Component interface
 */
export interface UIComponent {
  render(): HTMLElement;
  destroy(): void;
}

/**
 * Matching Game UI Component
 * Displays element symbols and name options for matching
 */
export class MatchingGameUI implements UIComponent {
  private container: HTMLElement;
  private currentElement: Element;
  private options: Element[];
  private onSelection: SelectionCallback;

  constructor(
    currentElement: Element,
    options: Element[],
    onSelection: SelectionCallback,
  ) {
    this.currentElement = currentElement;
    this.options = options;
    this.onSelection = onSelection;
    this.container = document.createElement('div');
  }

  /**
   * Render the matching game UI
   */
  render(): HTMLElement {
    this.container.className = 'matching-game-ui';
    this.container.innerHTML = '';

    // Create question section
    const questionSection = document.createElement('div');
    questionSection.className = 'matching-question';
    questionSection.innerHTML = `
      <div class="element-symbol">${this.currentElement.symbol}</div>
      <p class="element-atomic-number">原子番号: ${this.currentElement.atomicNumber}</p>
    `;

    // Create options section
    const optionsSection = document.createElement('div');
    optionsSection.className = 'matching-options';

    this.options.forEach((option) => {
      const button = document.createElement('button');
      button.className = 'matching-option-button';
      button.textContent = option.name;
      button.setAttribute('data-element-id', option.id);
      button.addEventListener('click', () => {
        this.onSelection(option.name);
      });
      optionsSection.appendChild(button);
    });

    this.container.appendChild(questionSection);
    this.container.appendChild(optionsSection);

    return this.container;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Quiz Game UI Component
 * Displays quiz questions with multiple choice options
 */
export class QuizGameUI implements UIComponent {
  private container: HTMLElement;
  private currentElement: Element;
  private question: string;
  private options: string[];
  private onSelection: SelectionCallback;

  constructor(
    currentElement: Element,
    question: string,
    options: string[],
    onSelection: SelectionCallback,
  ) {
    this.currentElement = currentElement;
    this.question = question;
    this.options = options;
    this.onSelection = onSelection;
    this.container = document.createElement('div');
  }

  /**
   * Render the quiz game UI
   */
  render(): HTMLElement {
    this.container.className = 'quiz-game-ui';
    this.container.innerHTML = '';

    // Create question section
    const questionSection = document.createElement('div');
    questionSection.className = 'quiz-question';
    questionSection.innerHTML = `
      <h3>${this.question}</h3>
      <p class="element-info">${this.currentElement.symbol} - ${this.currentElement.name}</p>
    `;

    // Create options section
    const optionsSection = document.createElement('div');
    optionsSection.className = 'quiz-options';

    this.options.forEach((option) => {
      const button = document.createElement('button');
      button.className = 'quiz-option-button';
      button.textContent = option;
      button.addEventListener('click', () => {
        this.onSelection(option);
      });
      optionsSection.appendChild(button);
    });

    this.container.appendChild(questionSection);
    this.container.appendChild(optionsSection);

    return this.container;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Chemical Formula Puzzle UI Component
 * Displays chemical formula puzzle with element selection
 */
export class ChemicalFormulaPuzzleUI implements UIComponent {
  private container: HTMLElement;
  private formula: ChemicalFormula;
  private availableElements: Element[];
  private onSelection: SelectionCallback;

  constructor(
    formula: ChemicalFormula,
    availableElements: Element[],
    onSelection: SelectionCallback,
  ) {
    this.formula = formula;
    this.availableElements = availableElements;
    this.onSelection = onSelection;
    this.container = document.createElement('div');
  }

  /**
   * Render the chemical formula puzzle UI
   */
  render(): HTMLElement {
    this.container.className = 'chemical-formula-puzzle-ui';
    this.container.innerHTML = '';

    // Create formula section
    const formulaSection = document.createElement('div');
    formulaSection.className = 'formula-display';
    formulaSection.innerHTML = `
      <h3>化学式を完成させよう</h3>
      <div class="formula-target">${this.formula.formula}</div>
      <p class="formula-name">${this.formula.name}</p>
      <p class="formula-uses">用途: ${this.formula.commonUses.join(', ')}</p>
    `;

    // Create element selection section
    const elementsSection = document.createElement('div');
    elementsSection.className = 'formula-elements';
    elementsSection.innerHTML = '<h4>元素を選択:</h4>';

    const elementGrid = document.createElement('div');
    elementGrid.className = 'element-grid';

    this.availableElements.forEach((element) => {
      const button = document.createElement('button');
      button.className = 'element-button';
      button.textContent = element.symbol;
      button.setAttribute('data-element-id', element.id);
      button.addEventListener('click', () => {
        this.onSelection(element.symbol);
      });
      elementGrid.appendChild(button);
    });

    elementsSection.appendChild(elementGrid);
    this.container.appendChild(formulaSection);
    this.container.appendChild(elementsSection);

    return this.container;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Periodic Table Jigsaw Puzzle UI Component
 * Displays periodic table grid with drag-and-drop puzzle pieces
 */
export class PeriodicTableJigsawUI implements UIComponent {
  private container: HTMLElement;
  private puzzle: PeriodicTablePuzzle;
  private placedPieces: Map<string, { period: number; group: number }>;
  private onDragDrop: DragDropCallback;

  constructor(
    puzzle: PeriodicTablePuzzle,
    placedPieces: Map<string, { period: number; group: number }>,
    onDragDrop: DragDropCallback,
  ) {
    this.puzzle = puzzle;
    this.placedPieces = placedPieces;
    this.onDragDrop = onDragDrop;
    this.container = document.createElement('div');
  }

  /**
   * Render the periodic table jigsaw puzzle UI
   */
  render(): HTMLElement {
    this.container.className = 'periodic-table-jigsaw-ui';
    this.container.innerHTML = '';

    // Create title
    const title = document.createElement('h3');
    title.textContent = '周期表ジグソーパズルを完成させよう';
    this.container.appendChild(title);

    // Create periodic table grid
    const gridContainer = document.createElement('div');
    gridContainer.className = 'periodic-table-grid';

    // Create 7x18 grid for periodic table
    for (let period = 1; period <= 7; period++) {
      for (let group = 1; group <= 18; group++) {
        const cell = document.createElement('div');
        cell.className = 'periodic-table-cell';
        cell.setAttribute('data-period', period.toString());
        cell.setAttribute('data-group', group.toString());

        // Check if a piece is placed at this position
        const placedElement = Array.from(this.placedPieces.entries()).find(
          ([_, pos]) => pos.period === period && pos.group === group,
        );

        if (placedElement) {
          const element = this.puzzle.elements.find((e) => e.id === placedElement[0]);
          if (element) {
            cell.innerHTML = `
              <div class="element-piece placed">
                <div class="symbol">${element.symbol}</div>
                <div class="atomic-number">${element.atomicNumber}</div>
              </div>
            `;
            cell.classList.add('filled');
          }
        } else {
          cell.innerHTML = '<div class="empty-cell"></div>';
        }

        gridContainer.appendChild(cell);
      }
    }

    // Create remaining pieces section
    const remainingSection = document.createElement('div');
    remainingSection.className = 'remaining-pieces';
    remainingSection.innerHTML = '<h4>残りのピース:</h4>';

    const piecesContainer = document.createElement('div');
    piecesContainer.className = 'pieces-container';

    this.puzzle.elements.forEach((element) => {
      if (!this.placedPieces.has(element.id)) {
        const piece = document.createElement('div');
        piece.className = 'draggable-piece';
        piece.setAttribute('data-element-id', element.id);
        piece.draggable = true;
        piece.innerHTML = `
          <div class="symbol">${element.symbol}</div>
          <div class="atomic-number">${element.atomicNumber}</div>
        `;

        piece.addEventListener('dragstart', (e) => {
          (e.dataTransfer as DataTransfer).effectAllowed = 'move';
          (e.dataTransfer as DataTransfer).setData('elementId', element.id);
        });

        piecesContainer.appendChild(piece);
      }
    });

    remainingSection.appendChild(piecesContainer);

    // Add drag-over and drop handlers to grid cells
    Array.from(gridContainer.querySelectorAll('.periodic-table-cell')).forEach((cell) => {
      (cell as HTMLElement).addEventListener('dragover', (e) => {
        e.preventDefault();
        (e.dataTransfer as DataTransfer).dropEffect = 'move';
        (cell as HTMLElement).classList.add('drag-over');
      });

      (cell as HTMLElement).addEventListener('dragleave', () => {
        (cell as HTMLElement).classList.remove('drag-over');
      });

      (cell as HTMLElement).addEventListener('drop', (e) => {
        e.preventDefault();
        (cell as HTMLElement).classList.remove('drag-over');

        const elementId = (e.dataTransfer as DataTransfer).getData('elementId');
        const period = parseInt((cell as HTMLElement).getAttribute('data-period') || '0');
        const group = parseInt((cell as HTMLElement).getAttribute('data-group') || '0');

        this.onDragDrop(elementId, { period, group });
      });
    });

    this.container.appendChild(gridContainer);
    this.container.appendChild(remainingSection);

    return this.container;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Progress Tracking UI Component
 * Displays user progress, statistics, and badges
 */
export class ProgressTrackingUI implements UIComponent {
  private container: HTMLElement;
  private masteryLevel: number;
  private totalSessionTime: number;
  private averageAccuracy: number;
  private badges: Badge[];
  private unlockedBadges: string[];
  private streakDays: number;

  constructor(
    masteryLevel: number,
    totalSessionTime: number,
    averageAccuracy: number,
    badges: Badge[],
    unlockedBadges: string[],
    streakDays: number,
  ) {
    this.masteryLevel = masteryLevel;
    this.totalSessionTime = totalSessionTime;
    this.averageAccuracy = averageAccuracy;
    this.badges = badges;
    this.unlockedBadges = unlockedBadges;
    this.streakDays = streakDays;
    this.container = document.createElement('div');
  }

  /**
   * Render the progress tracking UI
   */
  render(): HTMLElement {
    this.container.className = 'progress-tracking-ui';
    this.container.innerHTML = '';

    // Create statistics section
    const statsSection = document.createElement('div');
    statsSection.className = 'progress-stats';
    statsSection.innerHTML = `
      <h3>学習進捗</h3>
      <div class="stat-item">
        <label>習熟度レベル:</label>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${this.masteryLevel}%"></div>
        </div>
        <span>${this.masteryLevel}%</span>
      </div>
      <div class="stat-item">
        <label>平均正答率:</label>
        <span>${this.averageAccuracy.toFixed(1)}%</span>
      </div>
      <div class="stat-item">
        <label>総学習時間:</label>
        <span>${Math.floor(this.totalSessionTime / 60)}分</span>
      </div>
      <div class="stat-item">
        <label>連続学習日数:</label>
        <span>${this.streakDays}日</span>
      </div>
    `;

    // Create badges section
    const badgesSection = document.createElement('div');
    badgesSection.className = 'badges-section';
    badgesSection.innerHTML = '<h3>バッジ</h3>';

    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'badges-container';

    this.badges.forEach((badge) => {
      const badgeElement = document.createElement('div');
      badgeElement.className = 'badge';

      if (this.unlockedBadges.includes(badge.id)) {
        badgeElement.classList.add('unlocked');
        badgeElement.innerHTML = `
          <div class="badge-icon">${badge.icon}</div>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-description">${badge.description}</div>
        `;
      } else {
        badgeElement.classList.add('locked');
        badgeElement.innerHTML = `
          <div class="badge-icon">🔒</div>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-description">条件: ${badge.criteria.threshold}</div>
        `;
      }

      badgesContainer.appendChild(badgeElement);
    });

    badgesSection.appendChild(badgesContainer);

    this.container.appendChild(statsSection);
    this.container.appendChild(badgesSection);

    return this.container;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Feedback UI Component
 * Displays feedback for correct/incorrect answers
 */
export class FeedbackUI implements UIComponent {
  private container: HTMLElement;
  private isCorrect: boolean;
  private message: string;
  private additionalInfo?: string;

  constructor(isCorrect: boolean, message: string, additionalInfo?: string) {
    this.isCorrect = isCorrect;
    this.message = message;
    this.additionalInfo = additionalInfo;
    this.container = document.createElement('div');
  }

  /**
   * Render the feedback UI
   */
  render(): HTMLElement {
    this.container.className = `feedback-ui ${this.isCorrect ? 'correct' : 'incorrect'}`;
    this.container.innerHTML = `
      <div class="feedback-icon">${this.isCorrect ? '✓' : '✗'}</div>
      <div class="feedback-message">${this.message}</div>
      ${this.additionalInfo ? `<div class="feedback-info">${this.additionalInfo}</div>` : ''}
    `;

    return this.container;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Reward Notification UI Component
 * Displays badge and achievement notifications
 */
export class RewardNotificationUI implements UIComponent {
  private container: HTMLElement;
  private badge: Badge;
  private message: string;

  constructor(badge: Badge, message: string) {
    this.badge = badge;
    this.message = message;
    this.container = document.createElement('div');
  }

  /**
   * Render the reward notification UI
   */
  render(): HTMLElement {
    this.container.className = 'reward-notification-ui';
    this.container.innerHTML = `
      <div class="reward-content">
        <div class="reward-icon">${this.badge.icon}</div>
        <h3>${this.badge.name}</h3>
        <p>${this.message}</p>
        <p class="badge-description">${this.badge.description}</p>
      </div>
    `;

    return this.container;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}
