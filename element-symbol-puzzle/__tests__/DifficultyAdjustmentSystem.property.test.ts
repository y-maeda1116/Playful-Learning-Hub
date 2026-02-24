/**
 * Property-based tests for DifficultyAdjustmentSystem
 * 
 * Tests universal properties that should hold across all inputs
 * **Validates: Requirements 6.4, 6.5**
 */

import fc from 'fast-check';
import { DifficultyAdjustmentSystem } from '../DifficultyAdjustmentSystem';

describe('DifficultyAdjustmentSystem - Property-Based Tests', () => {
  let system: DifficultyAdjustmentSystem;

  beforeEach(() => {
    system = new DifficultyAdjustmentSystem();
  });

  describe('Property 6: 正答率ベースの難易度調整 (Accuracy-Based Difficulty Adjustment)', () => {
    /**
     * Property: When accuracy >= 80%, difficulty should increase or stay at hard
     * When accuracy < 50%, difficulty should decrease or stay at easy
     * When 50% <= accuracy < 80%, difficulty should remain unchanged
     */
    it('should adjust difficulty correctly based on accuracy thresholds', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 0, max: 100 }),
          (userId, accuracy) => {
            const system = new DifficultyAdjustmentSystem();
            const initialDifficulty = system.getCurrentDifficulty(userId);

            const newDifficulty = system.adjustDifficulty(userId, accuracy);

            // Property: Difficulty progression follows the rules
            if (accuracy >= 80) {
              // Should increase or stay at hard
              const validProgression =
                (initialDifficulty === 'easy' && newDifficulty === 'medium') ||
                (initialDifficulty === 'medium' && newDifficulty === 'hard') ||
                (initialDifficulty === 'hard' && newDifficulty === 'hard');
              expect(validProgression).toBe(true);
            } else if (accuracy < 50) {
              // Should decrease or stay at easy
              const validProgression =
                (initialDifficulty === 'hard' && newDifficulty === 'medium') ||
                (initialDifficulty === 'medium' && newDifficulty === 'easy') ||
                (initialDifficulty === 'easy' && newDifficulty === 'easy');
              expect(validProgression).toBe(true);
            } else {
              // Should maintain difficulty
              expect(newDifficulty).toBe(initialDifficulty);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    /**
     * Property: Difficulty should never skip levels
     * Can only go from easy -> medium -> hard or hard -> medium -> easy
     */
    it('should never skip difficulty levels', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 0, max: 100 }),
          (userId, accuracy) => {
            fc.pre(userId.trim().length > 0); // Ensure valid userId

            const system = new DifficultyAdjustmentSystem();
            const initialDifficulty = system.getCurrentDifficulty(userId);
            const newDifficulty = system.adjustDifficulty(userId, accuracy);

            // Property: No skipping levels
            const validTransitions = [
              ['easy', 'easy'],
              ['easy', 'medium'],
              ['medium', 'easy'],
              ['medium', 'medium'],
              ['medium', 'hard'],
              ['hard', 'medium'],
              ['hard', 'hard'],
            ];

            const isValidTransition = validTransitions.some(
              ([from, to]) => from === initialDifficulty && to === newDifficulty,
            );
            expect(isValidTransition).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    /**
     * Property: Multiple adjustments should follow the same rules
     * Repeated adjustments should maintain consistency
     */
    it('should maintain consistency across multiple adjustments', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 }),
          (userId, accuracies) => {
            fc.pre(userId.trim().length > 0); // Ensure valid userId

            const system = new DifficultyAdjustmentSystem();

            let currentDifficulty = system.getCurrentDifficulty(userId);

            for (const accuracy of accuracies) {
              const newDifficulty = system.adjustDifficulty(userId, accuracy);

              // Verify each transition is valid
              const validTransitions = [
                ['easy', 'easy'],
                ['easy', 'medium'],
                ['medium', 'easy'],
                ['medium', 'medium'],
                ['medium', 'hard'],
                ['hard', 'medium'],
                ['hard', 'hard'],
              ];

              const isValidTransition = validTransitions.some(
                ([from, to]) => from === currentDifficulty && to === newDifficulty,
              );
              expect(isValidTransition).toBe(true);

              currentDifficulty = newDifficulty;
            }

            // Final difficulty should be one of the valid levels
            expect(['easy', 'medium', 'hard']).toContain(currentDifficulty);
          },
        ),
        { numRuns: 100 },
      );
    });

    /**
     * Property: High accuracy (>= 80%) should eventually lead to hard difficulty
     * Low accuracy (< 50%) should eventually lead to easy difficulty
     */
    it('should converge to appropriate difficulty levels', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 80, max: 100 }),
          (userId, highAccuracy) => {
            const system = new DifficultyAdjustmentSystem();

            // Apply high accuracy multiple times
            let difficulty = system.getCurrentDifficulty(userId);
            for (let i = 0; i < 3; i++) {
              difficulty = system.adjustDifficulty(userId, highAccuracy);
            }

            // Should reach hard difficulty
            expect(difficulty).toBe('hard');
          },
        ),
        { numRuns: 50 },
      );
    });

    /**
     * Property: Low accuracy (< 50%) should eventually lead to easy difficulty
     */
    it('should converge to easy difficulty with low accuracy', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 0, max: 49 }),
          (userId, lowAccuracy) => {
            const system = new DifficultyAdjustmentSystem();
            system.setDifficulty(userId, 'hard');

            // Apply low accuracy multiple times
            let difficulty = system.getCurrentDifficulty(userId);
            for (let i = 0; i < 3; i++) {
              difficulty = system.adjustDifficulty(userId, lowAccuracy);
            }

            // Should reach easy difficulty
            expect(difficulty).toBe('easy');
          },
        ),
        { numRuns: 50 },
      );
    });

    /**
     * Property: Difficulty should be idempotent at boundaries
     * Adjusting at 80% from easy should go to medium
     * Adjusting at 80% from medium should go to hard
     * Adjusting at 80% from hard should stay at hard
     */
    it('should handle 80% accuracy boundary correctly', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (userId) => {
          const system = new DifficultyAdjustmentSystem();

          // From easy at 80%
          system.setDifficulty(userId, 'easy');
          let difficulty = system.adjustDifficulty(userId, 80);
          expect(difficulty).toBe('medium');

          // From medium at 80%
          system.setDifficulty(userId, 'medium');
          difficulty = system.adjustDifficulty(userId, 80);
          expect(difficulty).toBe('hard');

          // From hard at 80%
          system.setDifficulty(userId, 'hard');
          difficulty = system.adjustDifficulty(userId, 80);
          expect(difficulty).toBe('hard');
        }),
        { numRuns: 50 },
      );
    });

    /**
     * Property: Difficulty should be idempotent at 50% boundary
     * Adjusting at 50% should maintain current difficulty
     */
    it('should maintain difficulty at 50% accuracy boundary', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          fc.constantFrom('easy', 'medium', 'hard'),
          (userId, initialDifficulty) => {
            const system = new DifficultyAdjustmentSystem();
            system.setDifficulty(userId, initialDifficulty as 'easy' | 'medium' | 'hard');

            const newDifficulty = system.adjustDifficulty(userId, 50);
            expect(newDifficulty).toBe(initialDifficulty);
          },
        ),
        { numRuns: 50 },
      );
    });

    /**
     * Property: Different users should have independent difficulty levels
     * Adjusting one user's difficulty should not affect another user
     */
    it('should maintain independent difficulty levels for different users', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          (userId1, userId2, accuracy1, accuracy2) => {
            fc.pre(userId1 !== userId2); // Ensure different users

            const system = new DifficultyAdjustmentSystem();

            const difficulty1 = system.adjustDifficulty(userId1, accuracy1);
            const difficulty2 = system.adjustDifficulty(userId2, accuracy2);

            // Verify both users have their own difficulty levels
            expect(system.getCurrentDifficulty(userId1)).toBe(difficulty1);
            expect(system.getCurrentDifficulty(userId2)).toBe(difficulty2);

            // Adjusting one user should not affect the other
            system.adjustDifficulty(userId1, 95);
            expect(system.getCurrentDifficulty(userId2)).toBe(difficulty2);
          },
        ),
        { numRuns: 50 },
      );
    });

    /**
     * Property: Adjustment count should increase with each adjustment
     */
    it('should increment adjustment count with each call', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 }),
          (userId, accuracies) => {
            const system = new DifficultyAdjustmentSystem();

            for (let i = 0; i < accuracies.length; i++) {
              system.adjustDifficulty(userId, accuracies[i]);
              const progression = system.getDifficultyProgression(userId);
              expect(progression.adjustmentCount).toBe(i + 1);
            }
          },
        ),
        { numRuns: 50 },
      );
    });
  });
});
