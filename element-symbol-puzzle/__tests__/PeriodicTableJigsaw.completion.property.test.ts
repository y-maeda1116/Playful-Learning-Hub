/**
 * Property-Based Tests for Periodic Table Jigsaw Puzzle - Completion Detection
 * 
 * Tests universal properties that must hold across all inputs
 * using fast-check for property-based testing.
 */

import * as fc from 'fast-check';
import { PeriodicTableManager } from '../PeriodicTableManager';

describe('PeriodicTableJigsaw - Property-Based Tests: Completion Detection', () => {
  let manager: PeriodicTableManager;

  beforeEach(() => {
    manager = new PeriodicTableManager();
  });

  describe('Property 12: Jigsaw Puzzle Completion Detection', () => {
    /**
     * **Validates: Requirements 6.4, 6.5**
     * 
     * Property: For any periodic table jigsaw puzzle, when all pieces are correctly
     * placed, the system must detect puzzle completion and display learning information.
     * 
     * This ensures that:
     * - Puzzle completion is correctly detected when all pieces are placed
     * - Incomplete puzzles are not marked as complete
     * - Learning information is available for completed puzzles
     * - Completion detection is consistent across all difficulty levels
     * - Partially completed puzzles are not marked as complete
     */
    it('should detect puzzle completion when all pieces are correctly placed', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(difficultyArbitrary, (difficulty) => {
        const puzzle = manager.getPuzzle(difficulty);
        const placedPieces = new Map<string, { period: number; group: number }>();

        // Place all pieces in their correct positions
        for (const element of puzzle.elements) {
          placedPieces.set(element.id, {
            period: element.periodicTablePosition.period,
            group: element.periodicTablePosition.group,
          });
        }

        // Verify puzzle is marked as complete
        const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);

        return isComplete === true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should not detect completion for empty puzzles', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(difficultyArbitrary, (difficulty) => {
        const puzzle = manager.getPuzzle(difficulty);
        const placedPieces = new Map<string, { period: number; group: number }>();

        // Don't place any pieces
        const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);

        return isComplete === false;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should not detect completion for partially completed puzzles', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(
        difficultyArbitrary,
        fc.integer({ min: 1, max: 100 }),
        (difficulty, seed) => {
          const puzzle = manager.getPuzzle(difficulty);
          const placedPieces = new Map<string, { period: number; group: number }>();

          // Place only some pieces (not all)
          const numToPlace = Math.max(1, (seed % puzzle.elements.length) || 1);
          if (numToPlace >= puzzle.elements.length) {
            // Skip if we would place all pieces
            return true;
          }

          for (let i = 0; i < numToPlace; i++) {
            const element = puzzle.elements[i];
            placedPieces.set(element.id, {
              period: element.periodicTablePosition.period,
              group: element.periodicTablePosition.group,
            });
          }

          // Verify puzzle is not marked as complete
          const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);

          return isComplete === false;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should not detect completion for incorrectly placed pieces', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(difficultyArbitrary, (difficulty) => {
        const puzzle = manager.getPuzzle(difficulty);
        const placedPieces = new Map<string, { period: number; group: number }>();

        // Place all pieces but in wrong positions
        for (const element of puzzle.elements) {
          placedPieces.set(element.id, {
            period: 1, // Always place at period 1
            group: 1, // Always place at group 1
          });
        }

        // Verify puzzle is not marked as complete (unless all elements happen to be at 1,1)
        const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);

        // This should be false unless all elements are actually at position 1,1
        // which is extremely unlikely
        return isComplete === false;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should provide learning information for completed puzzles', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(difficultyArbitrary, (difficulty) => {
        const puzzle = manager.getPuzzle(difficulty);

        // Get learning information
        const learningInfo = manager.getLearningInfo(puzzle);

        // Verify learning information is available and contains expected data
        if (!learningInfo) {
          return false;
        }

        if (!learningInfo.periodsInfo || !learningInfo.groupsInfo || !learningInfo.categoriesInfo) {
          return false;
        }

        // Verify the information contains expected keywords
        if (!learningInfo.periodsInfo.includes('周期')) {
          return false;
        }

        if (!learningInfo.groupsInfo.includes('族')) {
          return false;
        }

        if (!learningInfo.categoriesInfo.includes('分類')) {
          return false;
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should provide accurate puzzle statistics', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(
        difficultyArbitrary,
        fc.integer({ min: 0, max: 100 }),
        (difficulty, seed) => {
          const puzzle = manager.getPuzzle(difficulty);
          const placedPieces = new Map<string, { period: number; group: number }>();

          // Place a variable number of pieces
          const numToPlace = seed % (puzzle.elements.length + 1);

          for (let i = 0; i < numToPlace; i++) {
            const element = puzzle.elements[i];
            placedPieces.set(element.id, {
              period: element.periodicTablePosition.period,
              group: element.periodicTablePosition.group,
            });
          }

          // Get statistics
          const stats = manager.getPuzzleStats(placedPieces, puzzle);

          // Verify statistics are accurate
          if (stats.placed !== numToPlace) {
            return false;
          }

          if (stats.total !== puzzle.totalPieces) {
            return false;
          }

          if (stats.remaining !== puzzle.totalPieces - numToPlace) {
            return false;
          }

          // Verify percentage calculation
          const expectedPercentage = (numToPlace / puzzle.totalPieces) * 100;
          if (Math.abs(stats.percentage - expectedPercentage) > 0.01) {
            return false;
          }

          return true;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should maintain completion detection consistency across multiple calls', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(difficultyArbitrary, (difficulty) => {
        const puzzle = manager.getPuzzle(difficulty);
        const placedPieces = new Map<string, { period: number; group: number }>();

        // Place all pieces correctly
        for (const element of puzzle.elements) {
          placedPieces.set(element.id, {
            period: element.periodicTablePosition.period,
            group: element.periodicTablePosition.group,
          });
        }

        // Check completion multiple times
        const result1 = manager.isPuzzleComplete(placedPieces, puzzle);
        const result2 = manager.isPuzzleComplete(placedPieces, puzzle);
        const result3 = manager.isPuzzleComplete(placedPieces, puzzle);

        // All results should be consistent and true
        return result1 === result2 && result2 === result3 && result1 === true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should correctly identify completion for all difficulty levels', () => {
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

      for (const difficulty of difficulties) {
        const puzzle = manager.getPuzzle(difficulty);
        const placedPieces = new Map<string, { period: number; group: number }>();

        // Place all pieces
        for (const element of puzzle.elements) {
          placedPieces.set(element.id, {
            period: element.periodicTablePosition.period,
            group: element.periodicTablePosition.group,
          });
        }

        // Verify completion is detected
        const isComplete = manager.isPuzzleComplete(placedPieces, puzzle);
        expect(isComplete).toBe(true);

        // Verify statistics show 100% completion
        const stats = manager.getPuzzleStats(placedPieces, puzzle);
        expect(stats.percentage).toBe(100);
        expect(stats.remaining).toBe(0);
      }
    });
  });
});
