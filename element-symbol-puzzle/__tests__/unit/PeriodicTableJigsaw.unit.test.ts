/**
 * Unit Tests for Periodic Table Jigsaw Puzzle Functionality
 * 
 * Tests specific examples, edge cases, and error conditions for jigsaw puzzle features
 */

import { PeriodicTableManager } from '../../src/managers/PeriodicTableManager';
import { ElementContentManager } from '../../src/managers/ElementContentManager';

describe('PeriodicTableJigsaw - Unit Tests', () => {
  let manager: PeriodicTableManager;
  let contentManager: ElementContentManager;

  beforeEach(() => {
    manager = new PeriodicTableManager();
    contentManager = new ElementContentManager();
  });

  describe('Piece Placement Validation', () => {
    it('should accept hydrogen at period 1, group 1', () => {
      const hydrogen = contentManager.getElement('H')!;
      const isValid = manager.validateElementPlacement(hydrogen, 1, 1);
      expect(isValid).toBe(true);
    });

    it('should accept oxygen at period 2, group 16', () => {
      const oxygen = contentManager.getElement('O')!;
      const isValid = manager.validateElementPlacement(oxygen, 2, 16);
      expect(isValid).toBe(true);
    });

    it('should reject hydrogen at period 2, group 1', () => {
      const hydrogen = contentManager.getElement('H')!;
      const isValid = manager.validateElementPlacement(hydrogen, 2, 1);
      expect(isValid).toBe(false);
    });

    it('should reject oxygen at period 1, group 16', () => {
      const oxygen = contentManager.getElement('O')!;
      const isValid = manager.validateElementPlacement(oxygen, 1, 16);
      expect(isValid).toBe(false);
    });

    it('should reject placement at period 0', () => {
      const hydrogen = contentManager.getElement('H')!;
      const isValid = manager.validateElementPlacement(hydrogen, 0, 1);
      expect(isValid).toBe(false);
    });

    it('should reject placement at period 8', () => {
      const hydrogen = contentManager.getElement('H')!;
      const isValid = manager.validateElementPlacement(hydrogen, 8, 1);
      expect(isValid).toBe(false);
    });

    it('should reject placement at group 0', () => {
      const hydrogen = contentManager.getElement('H')!;
      const isValid = manager.validateElementPlacement(hydrogen, 1, 0);
      expect(isValid).toBe(false);
    });

    it('should reject placement at group 19', () => {
      const hydrogen = contentManager.getElement('H')!;
      const isValid = manager.validateElementPlacement(hydrogen, 1, 19);
      expect(isValid).toBe(false);
    });

    it('should validate all elements in easy puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      puzzle.elements.forEach((element) => {
        const isValid = manager.validateElementPlacement(
          element,
          element.periodicTablePosition.period,
          element.periodicTablePosition.group,
        );
        expect(isValid).toBe(true);
      });
    });

    it('should validate all elements in medium puzzle', () => {
      const puzzle = manager.getPuzzle('medium');
      puzzle.elements.forEach((element) => {
        const isValid = manager.validateElementPlacement(
          element,
          element.periodicTablePosition.period,
          element.periodicTablePosition.group,
        );
        expect(isValid).toBe(true);
      });
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

  describe('Puzzle Completion Detection', () => {
    it('should detect empty puzzle as incomplete', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();
      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(false);
    });

    it('should detect partially completed easy puzzle as incomplete', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      // Place only first element
      const firstElement = puzzle.elements[0];
      placedPieces.set(firstElement.id, {
        period: firstElement.periodicTablePosition.period,
        group: firstElement.periodicTablePosition.group,
      });

      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(false);
    });

    it('should detect completed easy puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      // Place all elements
      puzzle.elements.forEach((element) => {
        placedPieces.set(element.id, {
          period: element.periodicTablePosition.period,
          group: element.periodicTablePosition.group,
        });
      });

      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(true);
    });

    it('should detect completed medium puzzle', () => {
      const puzzle = manager.getPuzzle('medium');
      const placedPieces = new Map();

      // Place all elements
      puzzle.elements.forEach((element) => {
        placedPieces.set(element.id, {
          period: element.periodicTablePosition.period,
          group: element.periodicTablePosition.group,
        });
      });

      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(true);
    });

    it('should detect completed hard puzzle', () => {
      const puzzle = manager.getPuzzle('hard');
      const placedPieces = new Map();

      // Place all elements
      puzzle.elements.forEach((element) => {
        placedPieces.set(element.id, {
          period: element.periodicTablePosition.period,
          group: element.periodicTablePosition.group,
        });
      });

      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(true);
    });

    it('should reject puzzle with all pieces at wrong position', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      // Place all elements at wrong position (1, 1)
      puzzle.elements.forEach((element) => {
        placedPieces.set(element.id, { period: 1, group: 1 });
      });

      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(false);
    });

    it('should reject puzzle with one piece at wrong position', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      // Place all elements correctly except the last one
      puzzle.elements.forEach((element, index) => {
        if (index === puzzle.elements.length - 1) {
          placedPieces.set(element.id, { period: 1, group: 1 }); // Wrong position
        } else {
          placedPieces.set(element.id, {
            period: element.periodicTablePosition.period,
            group: element.periodicTablePosition.group,
          });
        }
      });

      const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
      expect(isComplete).toBe(false);
    });
  });

  describe('Drag & Drop Functionality', () => {
    it('should track placed pieces correctly', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      const element = puzzle.elements[0];
      placedPieces.set(element.id, {
        period: element.periodicTablePosition.period,
        group: element.periodicTablePosition.group,
      });

      expect(placedPieces.has(element.id)).toBe(true);
      expect(placedPieces.get(element.id)).toEqual({
        period: element.periodicTablePosition.period,
        group: element.periodicTablePosition.group,
      });
    });

    it('should allow updating piece position', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      const element = puzzle.elements[0];

      // Initial placement
      placedPieces.set(element.id, { period: 1, group: 1 });
      expect(placedPieces.get(element.id)).toEqual({ period: 1, group: 1 });

      // Update placement
      placedPieces.set(element.id, {
        period: element.periodicTablePosition.period,
        group: element.periodicTablePosition.group,
      });

      expect(placedPieces.get(element.id)).toEqual({
        period: element.periodicTablePosition.period,
        group: element.periodicTablePosition.group,
      });
    });

    it('should track multiple placed pieces', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      // Place first 5 elements
      for (let i = 0; i < 5; i++) {
        const element = puzzle.elements[i];
        placedPieces.set(element.id, {
          period: element.periodicTablePosition.period,
          group: element.periodicTablePosition.group,
        });
      }

      expect(placedPieces.size).toBe(5);
    });

    it('should allow removing placed pieces', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      const element = puzzle.elements[0];
      placedPieces.set(element.id, {
        period: element.periodicTablePosition.period,
        group: element.periodicTablePosition.group,
      });

      expect(placedPieces.has(element.id)).toBe(true);

      placedPieces.delete(element.id);
      expect(placedPieces.has(element.id)).toBe(false);
    });
  });

  describe('Difficulty-Specific Puzzles', () => {
    it('should have 15 elements in easy puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      expect(puzzle.elements.length).toBe(15);
      expect(puzzle.totalPieces).toBe(15);
    });

    it('should have 25 elements in medium puzzle', () => {
      const puzzle = manager.getPuzzle('medium');
      expect(puzzle.elements.length).toBe(25);
      expect(puzzle.totalPieces).toBe(25);
    });

    it('should have 30 elements in hard puzzle', () => {
      const puzzle = manager.getPuzzle('hard');
      expect(puzzle.elements.length).toBe(30);
      expect(puzzle.totalPieces).toBe(30);
    });

    it('should have correct grade level for easy puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      expect(puzzle.gradeLevel).toBe(5);
    });

    it('should have correct grade level for medium puzzle', () => {
      const puzzle = manager.getPuzzle('medium');
      expect(puzzle.gradeLevel).toBe(5);
    });

    it('should have correct grade level for hard puzzle', () => {
      const puzzle = manager.getPuzzle('hard');
      expect(puzzle.gradeLevel).toBe(6);
    });

    it('should return medium puzzle for grade 5', () => {
      const puzzle = manager.getPuzzleForGrade(5);
      expect(puzzle.difficulty).toBe('medium');
    });

    it('should return hard puzzle for grade 6', () => {
      const puzzle = manager.getPuzzleForGrade(6);
      expect(puzzle.difficulty).toBe('hard');
    });

    it('should have increasing difficulty progression', () => {
      const easy = manager.getPuzzle('easy');
      const medium = manager.getPuzzle('medium');
      const hard = manager.getPuzzle('hard');

      expect(easy.elements.length).toBeLessThan(medium.elements.length);
      expect(medium.elements.length).toBeLessThan(hard.elements.length);
    });

    it('should have all easy puzzle elements in medium puzzle', () => {
      const easy = manager.getPuzzle('easy');
      const medium = manager.getPuzzle('medium');

      const easyIds = new Set(easy.elements.map((e) => e.id));
      const mediumIds = new Set(medium.elements.map((e) => e.id));

      for (const id of easyIds) {
        expect(mediumIds.has(id)).toBe(true);
      }
    });

    it('should have all medium puzzle elements in hard puzzle', () => {
      const medium = manager.getPuzzle('medium');
      const hard = manager.getPuzzle('hard');

      const mediumIds = new Set(medium.elements.map((e) => e.id));
      const hardIds = new Set(hard.elements.map((e) => e.id));

      for (const id of mediumIds) {
        expect(hardIds.has(id)).toBe(true);
      }
    });
  });

  describe('Puzzle Statistics', () => {
    it('should calculate correct stats for empty puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      const stats = manager.getPuzzleStats(placedPieces, puzzle);

      expect(stats.placed).toBe(0);
      expect(stats.total).toBe(15);
      expect(stats.percentage).toBe(0);
      expect(stats.remaining).toBe(15);
    });

    it('should calculate correct stats for 50% completed puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      // Place 7-8 elements (approximately 50%)
      for (let i = 0; i < 7; i++) {
        const element = puzzle.elements[i];
        placedPieces.set(element.id, {
          period: element.periodicTablePosition.period,
          group: element.periodicTablePosition.group,
        });
      }

      const stats = manager.getPuzzleStats(placedPieces, puzzle);

      expect(stats.placed).toBe(7);
      expect(stats.total).toBe(15);
      expect(stats.percentage).toBeCloseTo((7 / 15) * 100, 1);
      expect(stats.remaining).toBe(8);
    });

    it('should calculate correct stats for completed puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const placedPieces = new Map();

      // Place all elements
      puzzle.elements.forEach((element) => {
        placedPieces.set(element.id, {
          period: element.periodicTablePosition.period,
          group: element.periodicTablePosition.group,
        });
      });

      const stats = manager.getPuzzleStats(placedPieces, puzzle);

      expect(stats.placed).toBe(15);
      expect(stats.total).toBe(15);
      expect(stats.percentage).toBe(100);
      expect(stats.remaining).toBe(0);
    });

    it('should provide learning information for easy puzzle', () => {
      const puzzle = manager.getPuzzle('easy');
      const info = manager.getLearningInfo(puzzle);

      expect(info.periodsInfo).toBeDefined();
      expect(info.groupsInfo).toBeDefined();
      expect(info.categoriesInfo).toBeDefined();

      expect(info.periodsInfo).toContain('周期');
      expect(info.groupsInfo).toContain('族');
      expect(info.categoriesInfo).toContain('分類');
    });

    it('should provide learning information for hard puzzle', () => {
      const puzzle = manager.getPuzzle('hard');
      const info = manager.getLearningInfo(puzzle);

      expect(info.periodsInfo).toBeDefined();
      expect(info.groupsInfo).toBeDefined();
      expect(info.categoriesInfo).toBeDefined();

      // Hard puzzle should include all periods
      expect(info.periodsInfo).toContain('1');
      expect(info.periodsInfo).toContain('6');
    });
  });

  describe('Element Position Lookup', () => {
    it('should find hydrogen at period 1, group 1', () => {
      const element = manager.getElementAtPosition(1, 1);
      expect(element).toBeDefined();
      expect(element?.symbol).toBe('H');
    });

    it('should find oxygen at period 2, group 16', () => {
      const element = manager.getElementAtPosition(2, 16);
      expect(element).toBeDefined();
      expect(element?.symbol).toBe('O');
    });

    it('should return undefined for empty position', () => {
      const element = manager.getElementAtPosition(1, 13);
      expect(element).toBeUndefined();
    });

    it('should return undefined for invalid position', () => {
      const element = manager.getElementAtPosition(0, 1);
      expect(element).toBeUndefined();
    });

    it('should return undefined for out of range position', () => {
      const element = manager.getElementAtPosition(8, 1);
      expect(element).toBeUndefined();
    });
  });

  describe('Period and Group Queries', () => {
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

    it('should return empty array for invalid period', () => {
      const elements = manager.getElementsByPeriod(0);
      expect(elements.length).toBe(0);
    });

    it('should return empty array for invalid group', () => {
      const elements = manager.getElementsByGroup(0);
      expect(elements.length).toBe(0);
    });
  });

  describe('Category Queries', () => {
    it('should return alkali metal elements', () => {
      const elements = manager.getElementsByCategory('alkaliMetal');
      expect(elements.length).toBeGreaterThan(0);
      expect(elements.every((e) => e.periodicTablePosition.category === 'alkaliMetal')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const elements = manager.getElementsByCategory('nonExistent');
      expect(elements.length).toBe(0);
    });
  });
});
