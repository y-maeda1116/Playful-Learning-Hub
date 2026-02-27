/**
 * Property-Based Tests for Periodic Table Jigsaw Puzzle - Placement Validation
 * 
 * Tests universal properties that must hold across all inputs
 * using fast-check for property-based testing.
 */

import * as fc from 'fast-check';
import { PeriodicTableManager } from '../PeriodicTableManager';
import { ElementContentManager } from '../ElementContentManager';

describe('PeriodicTableJigsaw - Property-Based Tests: Placement Validation', () => {
  let manager: PeriodicTableManager;
  let contentManager: ElementContentManager;

  beforeEach(() => {
    manager = new PeriodicTableManager();
    contentManager = new ElementContentManager();
  });

  describe('Property 11: Periodic Table Jigsaw Puzzle Placement Validation', () => {
    /**
     * **Validates: Requirements 6.1, 6.2, 6.3**
     * 
     * Property: For any periodic table jigsaw puzzle session, when a user places
     * an element piece, the system must only accept correct period and group positions.
     * 
     * This ensures that:
     * - Only correct placements are accepted
     * - Incorrect placements are rejected
     * - Placement validation is consistent across all elements
     * - All elements in a puzzle have valid periodic table positions
     * - Position validation respects periodic table boundaries (1-7 periods, 1-18 groups)
     */
    it('should only accept correct element placements', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(difficultyArbitrary, (difficulty) => {
        const puzzle = manager.getPuzzle(difficulty);

        // For each element in the puzzle, verify that correct placement is accepted
        for (const element of puzzle.elements) {
          const correctPeriod = element.periodicTablePosition.period;
          const correctGroup = element.periodicTablePosition.group;

          // Verify correct placement is accepted
          const isValidCorrect = manager.validateElementPlacement(
            element,
            correctPeriod,
            correctGroup,
          );

          if (!isValidCorrect) {
            return false;
          }
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should reject incorrect element placements', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(
        difficultyArbitrary,
        fc.integer({ min: 1, max: 7 }),
        fc.integer({ min: 1, max: 18 }),
        (difficulty, wrongPeriod, wrongGroup) => {
          const puzzle = manager.getPuzzle(difficulty);

          // For each element, verify that incorrect placements are rejected
          for (const element of puzzle.elements) {
            const correctPeriod = element.periodicTablePosition.period;
            const correctGroup = element.periodicTablePosition.group;

            // Skip if the random position happens to be correct
            if (wrongPeriod === correctPeriod && wrongGroup === correctGroup) {
              continue;
            }

            // Verify incorrect placement is rejected
            const isValidWrong = manager.validateElementPlacement(
              element,
              wrongPeriod,
              wrongGroup,
            );

            if (isValidWrong) {
              return false;
            }
          }

          return true;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should reject placements outside valid periodic table boundaries', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(difficultyArbitrary, (difficulty) => {
        const puzzle = manager.getPuzzle(difficulty);
        const element = puzzle.elements[0];

        // Test invalid periods (outside 1-7 range)
        const invalidPeriods = [0, -1, 8, 9, 100];
        for (const period of invalidPeriods) {
          const isValid = manager.validateElementPlacement(element, period, 1);
          if (isValid) {
            return false;
          }
        }

        // Test invalid groups (outside 1-18 range)
        const invalidGroups = [0, -1, 19, 20, 100];
        for (const group of invalidGroups) {
          const isValid = manager.validateElementPlacement(element, 1, group);
          if (isValid) {
            return false;
          }
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should validate all elements in puzzle have correct positions', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(difficultyArbitrary, (difficulty) => {
        const puzzle = manager.getPuzzle(difficulty);

        // Verify every element in the puzzle has a valid position
        for (const element of puzzle.elements) {
          // Check that the element's position is within valid range
          if (
            element.periodicTablePosition.period < 1 ||
            element.periodicTablePosition.period > 7 ||
            element.periodicTablePosition.group < 1 ||
            element.periodicTablePosition.group > 18
          ) {
            return false;
          }

          // Check that validation passes for the element's own position
          const isValid = manager.validateElementPlacement(
            element,
            element.periodicTablePosition.period,
            element.periodicTablePosition.group,
          );

          if (!isValid) {
            return false;
          }
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should maintain placement validation consistency across multiple calls', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(difficultyArbitrary, (difficulty) => {
        const puzzle = manager.getPuzzle(difficulty);
        const element = puzzle.elements[0];
        const period = element.periodicTablePosition.period;
        const group = element.periodicTablePosition.group;

        // Call validation multiple times and verify consistency
        const result1 = manager.validateElementPlacement(element, period, group);
        const result2 = manager.validateElementPlacement(element, period, group);
        const result3 = manager.validateElementPlacement(element, period, group);

        return result1 === result2 && result2 === result3 && result1 === true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should correctly identify element positions in periodic table', () => {
      const difficultyArbitrary = fc.oneof(
        fc.constant('easy' as const),
        fc.constant('medium' as const),
        fc.constant('hard' as const),
      );

      const property = fc.property(difficultyArbitrary, (difficulty) => {
        const puzzle = manager.getPuzzle(difficulty);

        // For each element, verify that getElementAtPosition returns the same element
        for (const element of puzzle.elements) {
          const period = element.periodicTablePosition.period;
          const group = element.periodicTablePosition.group;

          const foundElement = manager.getElementAtPosition(period, group);

          if (!foundElement || foundElement.id !== element.id) {
            return false;
          }
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });
  });
});
