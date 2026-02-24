/**
 * Unit tests for PeriodicTableManager
 * 
 * Tests periodic table puzzle creation, validation, and management
 */

import { PeriodicTableManager } from '../PeriodicTableManager';
import { ElementContentManager } from '../ElementContentManager';

describe('PeriodicTableManager', () => {
  let manager: PeriodicTableManager;
  let contentManager: ElementContentManager;

  beforeEach(() => {
    manager = new PeriodicTableManager();
    contentManager = new ElementContentManager();
  });

  describe('getPuzzle', () => {
    it('should return easy puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      expect(puzzle).toBeDefined();
      expect(puzzle.difficulty).toBe('easy');
      expect(puzzle.gradeLevel).toBe(5);
      expect(puzzle.elements.length).toBeGreaterThan(0);
    });

    it('should return medium puzzle', () => {
      const puzzle = manager.getPuzzle('medium');
      expect(puzzle).toBeDefined();
      expect(puzzle.difficulty).toBe('medium');
      expect(puzzle.gradeLevel).toBe(5);
      expect(puzzle.elements.length).toBeGreaterThan(0);
    });

    it('should return hard puzzle', () => {
      const puzzle = manager.getPuzzle('hard');
      expect(puzzle).toBeDefined();
      expect(puzzle.difficulty).toBe('hard');
      expect(puzzle.gradeLevel).toBe(6);
      expect(puzzle.elements.length).toBe(30);
    });

    it('should throw error for invalid difficulty', () => {
      expect(() => manager.getPuzzle('invalid' as any)).toThrow();
    });

    it('should have increasing difficulty levels', () => {
      const easy = manager.getPuzzle('easy');
      const medium = manager.getPuzzle('medium');
      const hard = manager.getPuzzle('hard');

      expect(easy.elements.length).toBeLessThanOrEqual(medium.elements.length);
      expect(medium.elements.length).toBeLessThanOrEqual(hard.elements.length);
    });
  });

  describe('getAllPuzzles', () => {
    it('should return all puzzles', () => {
      const puzzles = manager.getAllPuzzles();
      expect(puzzles.length).toBe(3);
    });

    it('should return puzzles with correct structure', () => {
      const puzzles = manager.getAllPuzzles();
      puzzles.forEach((puzzle) => {
        expect(puzzle).toHaveProperty('id');
        expect(puzzle).toHaveProperty('difficulty');
        expect(puzzle).toHaveProperty('gradeLevel');
        expect(puzzle).toHaveProperty('elements');
        expect(puzzle).toHaveProperty('totalPieces');
        expect(puzzle).toHaveProperty('description');
      });
    });
  });

  describe('validateElementPlacement', () => {
    it('should validate correct element placement', () => {
      const element = contentManager.getElement('H')!;
      const isValid = manager.validateElementPlacement(
        element,
        element.periodicTablePosition.period,
        element.periodicTablePosition.group,
      );
      expect(isValid).toBe(true);
    });

    it('should reject incorrect element placement', () => {
      const element = contentManager.getElement('H')!;
      const isValid = manager.validateElementPlacement(element, 5, 5);
      expect(isValid).toBe(false);
    });

    it('should reject placement outside valid range', () => {
      const element = contentManager.getElement('H')!;
      const isValid1 = manager.validateElementPlacement(element, 0, 1);
      const isValid2 = manager.validateElementPlacement(element, 8, 1);
      const isValid3 = manager.validateElementPlacement(element, 1, 0);
      const isValid4 = manager.validateElementPlacement(element, 1, 19);

      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
      expect(isValid3).toBe(false);
      expect(isValid4).toBe(false);
    });

    it('should validate all elements in hard puzzle', () => {
      const puzzle = manager.getPuzzle('hard');
      puzzle.elements.forEach((element) => {
        const isValid = manager.validateElementPlacement(
          element,
          element.periodicTablePosition.period,
          element.periodicTablePosition.group,
        );
        expect(isValid).toBe(true);
      });
    });
  });

  describe('getElementAtPosition', () => {
    it('should return element at valid position', () => {
      const element = contentManager.getElement('H')!;
      const found = manager.getElementAtPosition(
        element.periodicTablePosition.period,
        element.periodicTablePosition.group,
      );
      expect(found).toBeDefined();
      expect(found?.symbol).toBe('H');
    });

    it('should return undefined for empty position', () => {
      const found = manager.getElementAtPosition(1, 13);
      expect(found).toBeUndefined();
    });

    it('should return undefined for invalid position', () => {
      const found = manager.getElementAtPosition(0, 1);
      expect(found).toBeUndefined();
    });
  });

  describe('getElementsByPeriod', () => {
    it('should return elements in period 1', () => {
      const elements = manager.getElementsByPeriod(1);
      expect(elements.length).toBeGreaterThan(0);
      expect(elements.every((e) => e.periodicTablePosition.period === 1)).toBe(true);
    });

    it('should return elements in period 2', () => {
      const elements = manager.getElementsByPeriod(2);
      expect(elements.length).toBeGreaterThan(0);
      expect(elements.every((e) => e.periodicTablePosition.period === 2)).toBe(true);
    });

    it('should return empty array for invalid period', () => {
      const elements = manager.getElementsByPeriod(0);
      expect(elements.length).toBe(0);
    });
  });

  describe('getElementsByGroup', () => {
    it('should return elements in group 1', () => {
      const elements = manager.getElementsByGroup(1);
      expect(elements.length).toBeGreaterThan(0);
      expect(elements.every((e) => e.periodicTablePosition.group === 1)).toBe(true);
    });

    it('should return elements in group 18', () => {
      const elements = manager.getElementsByGroup(18);
      expect(elements.length).toBeGreaterThan(0);
      expect(elements.every((e) => e.periodicTablePosition.group === 18)).toBe(true);
    });

    it('should return empty array for invalid group', () => {
      const elements = manager.getElementsByGroup(0);
      expect(elements.length).toBe(0);
    });
  });

  describe('getElementsByCategory', () => {
    it('should return elements in alkali metal category', () => {
      const elements = manager.getElementsByCategory('alkaliMetal');
      expect(elements.length).toBeGreaterThan(0);
      expect(elements.every((e) => e.periodicTablePosition.category === 'alkaliMetal')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const elements = manager.getElementsByCategory('nonExistent');
      expect(elements.length).toBe(0);
    });
  });

  describe('isPuzzleComplete', () => {
    it('should return false for empty puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();
      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(false);
    });

    it('should return false for partially completed puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();
      const firstElement = puzzle.elements[0];
      placedPieces.set(firstElement.id, {
        period: firstElement.periodicTablePosition.period,
        group: firstElement.periodicTablePosition.group,
      });
      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(false);
    });

    it('should return true for completed puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();
      puzzle.elements.forEach((element) => {
        placedPieces.set(element.id, {
          period: element.periodicTablePosition.period,
          group: element.periodicTablePosition.group,
        });
      });
      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(true);
    });

    it('should return false for incorrectly placed pieces', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();
      puzzle.elements.forEach((element) => {
        placedPieces.set(element.id, { period: 1, group: 1 });
      });
      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(false);
    });
  });

  describe('getPuzzleForGrade', () => {
    it('should return medium puzzle for grade 5', () => {
      const puzzle = manager.getPuzzleForGrade(5);
      expect(puzzle.difficulty).toBe('medium');
    });

    it('should return hard puzzle for grade 6', () => {
      const puzzle = manager.getPuzzleForGrade(6);
      expect(puzzle.difficulty).toBe('hard');
    });
  });

  describe('getLearningInfo', () => {
    it('should return learning info for puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const info = manager.getLearningInfo(puzzle);

      expect(info).toHaveProperty('periodsInfo');
      expect(info).toHaveProperty('groupsInfo');
      expect(info).toHaveProperty('categoriesInfo');
      expect(info.periodsInfo).toContain('周期');
      expect(info.groupsInfo).toContain('族');
      expect(info.categoriesInfo).toContain('分類');
    });

    it('should include all periods in hard puzzle', () => {
      const puzzle = manager.getPuzzle('hard');
      const info = manager.getLearningInfo(puzzle);
      // Hard puzzle should include periods 1-6 at minimum
      expect(info.periodsInfo).toContain('1');
      expect(info.periodsInfo).toContain('6');
    });
  });

  describe('getPuzzleStats', () => {
    it('should return correct stats for empty puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();
      const stats = manager.getPuzzleStats(placedPieces, puzzle);

      expect(stats.placed).toBe(0);
      expect(stats.total).toBe(puzzle.totalPieces);
      expect(stats.percentage).toBe(0);
      expect(stats.remaining).toBe(puzzle.totalPieces);
    });

    it('should return correct stats for partially completed puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();
      const firstElement = puzzle.elements[0];
      placedPieces.set(firstElement.id, {
        period: firstElement.periodicTablePosition.period,
        group: firstElement.periodicTablePosition.group,
      });
      const stats = manager.getPuzzleStats(placedPieces, puzzle);

      expect(stats.placed).toBe(1);
      expect(stats.total).toBe(puzzle.totalPieces);
      expect(stats.percentage).toBeCloseTo((1 / puzzle.totalPieces) * 100, 1);
      expect(stats.remaining).toBe(puzzle.totalPieces - 1);
    });

    it('should return correct stats for completed puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();
      puzzle.elements.forEach((element) => {
        placedPieces.set(element.id, {
          period: element.periodicTablePosition.period,
          group: element.periodicTablePosition.group,
        });
      });
      const stats = manager.getPuzzleStats(placedPieces, puzzle);

      expect(stats.placed).toBe(puzzle.totalPieces);
      expect(stats.total).toBe(puzzle.totalPieces);
      expect(stats.percentage).toBe(100);
      expect(stats.remaining).toBe(0);
    });
  });
});
