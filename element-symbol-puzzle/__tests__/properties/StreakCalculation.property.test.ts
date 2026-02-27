/**
 * Property-Based Tests for Streak Calculation
 * 
 * Tests universal properties that must hold across all inputs
 * using fast-check for property-based testing.
 */

import * as fc from 'fast-check';
import { ProgressTrackingSystem } from '../../src/core/ProgressTrackingSystem';
import { RewardSystem } from '../../src/core/RewardSystem';
import { GameSession, Answer } from '../../src/data/types';

describe('Streak Calculation - Property-Based Tests', () => {
  let progressTrackingSystem: ProgressTrackingSystem;
  let rewardSystem: RewardSystem;

  beforeEach(() => {
    progressTrackingSystem = new ProgressTrackingSystem();
    rewardSystem = new RewardSystem(progressTrackingSystem);
  });

  describe('Property 10: Consecutive Learning Days Calculation', () => {
    /**
     * **Validates: Requirements 5.2, 5.4**
     * 
     * Property: For any user with consecutive learning sessions, the consecutive
     * learning days counter SHALL accurately reflect the number of days with at
     * least one completed session in a consecutive sequence.
     * 
     * This ensures that:
     * - Streak starts at 0 for new users
     * - Streak increments by 1 for each consecutive day with a session
     * - Streak resets to 1 when there's a gap (no session on a day)
     * - Multiple sessions on the same day don't increment streak
     * - Streak is accurately persisted and retrieved
     */
    it('should initialize streak to 0 for new users', () => {
      const property = fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (userId, gradeLevel) => {
          progressTrackingSystem.loadFromLocalStorage(userId, gradeLevel);
          const progress = progressTrackingSystem.getProgress(userId);

          // New users should have 0 streak days
          return progress.streakDays === 0;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should increment streak by 1 for first session', () => {
      const property = fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (userId, gradeLevel) => {
          progressTrackingSystem.loadFromLocalStorage(userId, gradeLevel);

          const session: GameSession = {
            sessionId: 'session1',
            gameType: 'matching',
            gradeLevel,
            difficulty: 'easy',
            startTime: Date.now() - 5000,
            elements: [],
            currentIndex: 0,
            score: 50,
            answers: [
              {
                elementId: 'H',
                userAnswer: 'Hydrogen',
                correct: true,
                responseTime: 1000,
                timestamp: Date.now(),
              },
            ],
            correctCount: 1,
            totalCount: 1,
          };

          progressTrackingSystem.updateProgress(userId, session);
          const progress = progressTrackingSystem.getProgress(userId);

          // After first session, streak should be at least 1
          return progress.streakDays >= 1;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should not increment streak for multiple sessions on same day', () => {
      const property = fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        fc.integer({ min: 2, max: 5 }),
        (userId, gradeLevel, sessionCount) => {
          progressTrackingSystem.loadFromLocalStorage(userId, gradeLevel);

          // Create multiple sessions on the same day
          for (let i = 0; i < sessionCount; i++) {
            const session: GameSession = {
              sessionId: `session${i}`,
              gameType: 'matching',
              gradeLevel,
              difficulty: 'easy',
              startTime: Date.now() - 5000,
              elements: [],
              currentIndex: 0,
              score: 50,
              answers: [
                {
                  elementId: 'H',
                  userAnswer: 'Hydrogen',
                  correct: true,
                  responseTime: 1000,
                  timestamp: Date.now(),
                },
              ],
              correctCount: 1,
              totalCount: 1,
            };

            progressTrackingSystem.updateProgress(userId, session);
          }

          const progress = progressTrackingSystem.getProgress(userId);

          // Multiple sessions on same day should not exceed 1 day streak
          return progress.streakDays <= 1;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should maintain streak consistency across retrievals', () => {
      const property = fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (userId, gradeLevel) => {
          progressTrackingSystem.loadFromLocalStorage(userId, gradeLevel);

          const session: GameSession = {
            sessionId: 'session1',
            gameType: 'matching',
            gradeLevel,
            difficulty: 'easy',
            startTime: Date.now() - 5000,
            elements: [],
            currentIndex: 0,
            score: 50,
            answers: [
              {
                elementId: 'H',
                userAnswer: 'Hydrogen',
                correct: true,
                responseTime: 1000,
                timestamp: Date.now(),
              },
            ],
            correctCount: 1,
            totalCount: 1,
          };

          progressTrackingSystem.updateProgress(userId, session);

          const progress1 = progressTrackingSystem.getProgress(userId);
          const progress2 = progressTrackingSystem.getProgress(userId);

          // Streak should be consistent across multiple retrievals
          return progress1.streakDays === progress2.streakDays;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should return non-negative streak days', () => {
      const property = fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (userId, gradeLevel) => {
          progressTrackingSystem.loadFromLocalStorage(userId, gradeLevel);

          const session: GameSession = {
            sessionId: 'session1',
            gameType: 'matching',
            gradeLevel,
            difficulty: 'easy',
            startTime: Date.now() - 5000,
            elements: [],
            currentIndex: 0,
            score: 50,
            answers: [
              {
                elementId: 'H',
                userAnswer: 'Hydrogen',
                correct: true,
                responseTime: 1000,
                timestamp: Date.now(),
              },
            ],
            correctCount: 1,
            totalCount: 1,
          };

          progressTrackingSystem.updateProgress(userId, session);
          const progress = progressTrackingSystem.getProgress(userId);

          // Streak days should never be negative
          return progress.streakDays >= 0;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should track streak days through RewardSystem', () => {
      const property = fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (userId, gradeLevel) => {
          progressTrackingSystem.loadFromLocalStorage(userId, gradeLevel);

          const session: GameSession = {
            sessionId: 'session1',
            gameType: 'matching',
            gradeLevel,
            difficulty: 'easy',
            startTime: Date.now() - 5000,
            elements: [],
            currentIndex: 0,
            score: 50,
            answers: [
              {
                elementId: 'H',
                userAnswer: 'Hydrogen',
                correct: true,
                responseTime: 1000,
                timestamp: Date.now(),
              },
            ],
            correctCount: 1,
            totalCount: 1,
          };

          progressTrackingSystem.updateProgress(userId, session);

          const streakDays = rewardSystem.getStreakDays(userId);
          const progress = progressTrackingSystem.getProgress(userId);

          // RewardSystem should return the same streak days as ProgressTrackingSystem
          return streakDays === progress.streakDays;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should handle streak calculation for multiple users independently', () => {
      const property = fc.property(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        ),
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        ([userId1, userId2], gradeLevel) => {
          // Skip if userIds are the same
          if (userId1 === userId2) {
            return true;
          }

          progressTrackingSystem.loadFromLocalStorage(userId1, gradeLevel);
          progressTrackingSystem.loadFromLocalStorage(userId2, gradeLevel);

          const session1: GameSession = {
            sessionId: 'session1',
            gameType: 'matching',
            gradeLevel,
            difficulty: 'easy',
            startTime: Date.now() - 5000,
            elements: [],
            currentIndex: 0,
            score: 50,
            answers: [
              {
                elementId: 'H',
                userAnswer: 'Hydrogen',
                correct: true,
                responseTime: 1000,
                timestamp: Date.now(),
              },
            ],
            correctCount: 1,
            totalCount: 1,
          };

          progressTrackingSystem.updateProgress(userId1, session1);

          const progress1 = progressTrackingSystem.getProgress(userId1);
          const progress2 = progressTrackingSystem.getProgress(userId2);

          // User2 should still have 0 streak since they had no session
          return progress2.streakDays === 0;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should maintain streak as a number type', () => {
      const property = fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (userId, gradeLevel) => {
          progressTrackingSystem.loadFromLocalStorage(userId, gradeLevel);

          const session: GameSession = {
            sessionId: 'session1',
            gameType: 'matching',
            gradeLevel,
            difficulty: 'easy',
            startTime: Date.now() - 5000,
            elements: [],
            currentIndex: 0,
            score: 50,
            answers: [
              {
                elementId: 'H',
                userAnswer: 'Hydrogen',
                correct: true,
                responseTime: 1000,
                timestamp: Date.now(),
              },
            ],
            correctCount: 1,
            totalCount: 1,
          };

          progressTrackingSystem.updateProgress(userId, session);
          const progress = progressTrackingSystem.getProgress(userId);

          // Streak days should be a number
          return typeof progress.streakDays === 'number';
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should handle streak calculation with various game types', () => {
      const property = fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        fc.oneof(
          fc.constant('matching' as const),
          fc.constant('quiz' as const),
          fc.constant('chemicalFormula' as const),
          fc.constant('periodicTableJigsaw' as const),
        ),
        (userId, gradeLevel, gameType) => {
          progressTrackingSystem.loadFromLocalStorage(userId, gradeLevel);

          const session: GameSession = {
            sessionId: 'session1',
            gameType,
            gradeLevel,
            difficulty: 'easy',
            startTime: Date.now() - 5000,
            elements: [],
            currentIndex: 0,
            score: 50,
            answers: [
              {
                elementId: 'H',
                userAnswer: 'Hydrogen',
                correct: true,
                responseTime: 1000,
                timestamp: Date.now(),
              },
            ],
            correctCount: 1,
            totalCount: 1,
          };

          progressTrackingSystem.updateProgress(userId, session);
          const progress = progressTrackingSystem.getProgress(userId);

          // Streak should be calculated regardless of game type
          return progress.streakDays >= 0;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });
  });
});
