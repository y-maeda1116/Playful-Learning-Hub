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
describe('PeriodicTableJigsawUI', () => {
  let mockCallback: vi.Mock;

  beforeEach(() => {
    mockCallback = vi.fn();
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

    // Simulate drag over（jsdom に DragEvent は無いため Event を使う。ハンドラ内で
    // dataTransfer.dropEffect を参照するためスタブを注入する）
    const dragOverEvent = new Event('dragover', { bubbles: true });
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: { dropEffect: 'none' },
    });
    firstCell.dispatchEvent(dragOverEvent);
    expect(firstCell.classList.contains('drag-over')).toBe(true);

    // Simulate drag leave
    const dragLeaveEvent = new Event('dragleave', { bubbles: true });
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

    // Create a drop event with data（jsdom に DragEvent は無いため Event を使う）
    const dropEvent = new Event('drop', { bubbles: true });
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
