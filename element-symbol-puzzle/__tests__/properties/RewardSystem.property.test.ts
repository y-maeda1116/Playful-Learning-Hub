/**
 * Property-Based Tests for Badge Criteria Consistency
 * 
 * Tests universal properties that must hold across all inputs
 * using fast-check for property-based testing.
 * 
 * Validates that badge criteria are consistently applied:
 * - When a user meets criteria, the badge is awarded
 * - When a user does not meet criteria, the badge is not awarded
 * - No false positives or false negatives in badge awarding
 */

import * as fc from 'fast-check';
import { RewardSystem } from '../../src/core/RewardSystem';
import { ProgressTrackingSystem } from '../../src/core/ProgressTrackingSystem';
import { UserProgress, GameSession, Badge } from '../../src/data/types';
import { BADGES } from '../../src/data/badges';

describe('Badge Criteria Consistency - Property-Based Tests', () => {
  let rewardSystem: RewardSystem;
  let progressTrackingSystem: ProgressTrackingSystem;

  beforeEach(() => {
    progressTrackingSystem = new ProgressTrackingSystem();
    rewardSystem = new RewardSystem(progressTrackingSystem);

    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    progressTrackingSystem.clearAllProgress();
  });

  /**
   * Arbitraries for generating test data
   */
  const userIdArbitrary = fc.stringMatching(/^user[0-9]{1,3}$/);

  const gradeLevelArbitrary = fc.oneof(
    fc.constant(3 as const),
    fc.constant(4 as const),
    fc.constant(5 as const),
    fc.constant(6 as const),
  );

  const elementStatusArbitrary = fc.oneof(
    fc.constant('not-started' as const),
    fc.constant('learning' as const),
    fc.constant('mastered' as const),
  );

  const elementProgressArbitrary = fc.record({
    status: elementStatusArbitrary,
    attempts: fc.integer({ min: 0, max: 100 }),
    correctAttempts: fc.integer({ min: 0, max: 100 }),
    lastAttempt: fc.integer({ min: 0, max: Date.now() }),
  });

  const elementsLearnedArbitrary = fc.dictionary(
    fc.stringMatching(/^[A-Z][a-z]?$/), // Element symbols like H, He, Li
    elementProgressArbitrary,
  );

  const userProgressArbitrary = fc.record({
    userId: userIdArbitrary,
    gradeLevel: gradeLevelArbitrary,
    elementsLearned: elementsLearnedArbitrary,
    totalSessionTime: fc.integer({ min: 0, max: 1000000 }),
    sessionCount: fc.integer({ min: 0, max: 1000 }),
    averageAccuracy: fc.integer({ min: 0, max: 100 }),
    badges: fc.array(fc.stringMatching(/^badge[0-9]{1,3}$/), { maxLength: 20 }),
    streakDays: fc.integer({ min: 0, max: 365 }),
    lastSessionDate: fc.integer({ min: 0, max: Date.now() }),
    jigsawPuzzlesCompleted: fc.integer({ min: 0, max: 100 }),
  });

  const gameSessionArbitrary = fc.record({
    sessionId: fc.uuid(),
    gameType: fc.oneof(
      fc.constant('matching' as const),
      fc.constant('quiz' as const),
      fc.constant('chemicalFormula' as const),
      fc.constant('periodicTableJigsaw' as const),
    ),
    gradeLevel: gradeLevelArbitrary,
    difficulty: fc.oneof(
      fc.constant('easy' as const),
      fc.constant('medium' as const),
      fc.constant('hard' as const),
    ),
    startTime: fc.integer({ min: 0, max: Date.now() }),
    elements: fc.array(fc.record({
      id: fc.stringMatching(/^[A-Z][a-z]?$/),
      symbol: fc.stringMatching(/^[A-Z][a-z]?$/),
      name: fc.string(),
      atomicNumber: fc.integer({ min: 1, max: 118 }),
      atomicWeight: fc.float({ min: 1, max: 300 }),
      type: fc.oneof(
        fc.constant('metal' as const),
        fc.constant('nonmetal' as const),
        fc.constant('metalloid' as const),
      ),
      category: fc.oneof(
        fc.constant('basic' as const),
        fc.constant('intermediate' as const),
        fc.constant('advanced' as const),
      ),
      gradeLevel: gradeLevelArbitrary,
      pronunciation: fc.string(),
      audioUrl: fc.webUrl(),
      commonUses: fc.array(fc.string(), { maxLength: 5 }),
      properties: fc.record({
        state: fc.oneof(
          fc.constant('solid' as const),
          fc.constant('liquid' as const),
          fc.constant('gas' as const),
        ),
        color: fc.string(),
        reactivity: fc.oneof(
          fc.constant('high' as const),
          fc.constant('medium' as const),
          fc.constant('low' as const),
        ),
      }),
      periodicTablePosition: fc.record({
        period: fc.integer({ min: 1, max: 7 }),
        group: fc.integer({ min: 1, max: 18 }),
        category: fc.string(),
      }),
    }), { maxLength: 10 }),
    currentIndex: fc.integer({ min: 0, max: 10 }),
    score: fc.integer({ min: 0, max: 1000 }),
    answers: fc.array(fc.record({
      elementId: fc.stringMatching(/^[A-Z][a-z]?$/),
      userAnswer: fc.string(),
      correct: fc.boolean(),
      responseTime: fc.integer({ min: 0, max: 60000 }),
      timestamp: fc.integer({ min: 0, max: Date.now() }),
    }), { maxLength: 10 }),
    correctCount: fc.integer({ min: 0, max: 10 }),
    totalCount: fc.integer({ min: 0, max: 10 }),
  });

  describe('Property 7: Badge Criteria Consistency', () => {
    /**
     * **Validates: Requirements 5.1, 5.4**
     * 
     * Property: For any badge criteria (elements-learned, accuracy threshold, streak),
     * when a user meets the criteria, the system must award the corresponding badge.
     * When a user does not meet the criteria, the badge must not be awarded.
     * 
     * This ensures that:
     * - Badge criteria are consistently evaluated
     * - No false positives (badges awarded when criteria not met)
     * - No false negatives (badges not awarded when criteria are met)
     * - All badge types are handled correctly
     */
    it('should award elements-learned badge when user masters enough elements', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session with 15 correct answers to master 15 elements
        const answers = [];
        for (let i = 0; i < 15; i++) {
          const symbol = String.fromCharCode(65 + i); // A, B, C, ...
          answers.push({
            elementId: symbol,
            userAnswer: symbol,
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          });
        }

        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 100,
          answers,
          correctCount: 15,
          totalCount: 15,
        };

        progressTrackingSystem.updateProgress(userId, session);

        // Check badge criteria
        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should include elements-15 badge
        return newBadges.includes('elements-15');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should not award elements-learned badge when user has fewer mastered elements', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session with only 10 correct answers
        const answers = [];
        for (let i = 0; i < 10; i++) {
          const symbol = String.fromCharCode(65 + i);
          answers.push({
            elementId: symbol,
            userAnswer: symbol,
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          });
        }

        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 100,
          answers,
          correctCount: 10,
          totalCount: 10,
        };

        progressTrackingSystem.updateProgress(userId, session);

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should NOT include elements-15 badge
        return !newBadges.includes('elements-15');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should award accuracy badge when user meets accuracy threshold', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session with 70% accuracy (7 correct out of 10)
        const answers = [];
        for (let i = 0; i < 10; i++) {
          answers.push({
            elementId: String.fromCharCode(65 + i),
            userAnswer: String.fromCharCode(65 + i),
            correct: i < 7, // First 7 are correct
            responseTime: 1000,
            timestamp: Date.now(),
          });
        }

        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 70,
          answers,
          correctCount: 7,
          totalCount: 10,
        };

        progressTrackingSystem.updateProgress(userId, session);

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should include accuracy-70 badge
        return newBadges.includes('accuracy-70');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should not award accuracy badge when user does not meet accuracy threshold', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session with 50% accuracy (5 correct out of 10)
        const answers = [];
        for (let i = 0; i < 10; i++) {
          answers.push({
            elementId: String.fromCharCode(65 + i),
            userAnswer: String.fromCharCode(65 + i),
            correct: i < 5, // First 5 are correct
            responseTime: 1000,
            timestamp: Date.now(),
          });
        }

        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 50,
          answers,
          correctCount: 5,
          totalCount: 10,
        };

        progressTrackingSystem.updateProgress(userId, session);

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should NOT include accuracy-70 badge
        return !newBadges.includes('accuracy-70');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should award streak badge when user meets consecutive learning days threshold', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session
        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 100,
          answers: [{
            elementId: 'H',
            userAnswer: 'H',
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          }],
          correctCount: 1,
          totalCount: 1,
        };

        progressTrackingSystem.updateProgress(userId, session);
        
        // Manually set streak to 7 days
        const progress = progressTrackingSystem.getProgress(userId);
        progress.streakDays = 7;

        // Check badge criteria
        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should include streak-7 badge
        return newBadges.includes('streak-7');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should not award streak badge when user does not meet consecutive learning days threshold', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session
        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 100,
          answers: [{
            elementId: 'H',
            userAnswer: 'H',
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          }],
          correctCount: 1,
          totalCount: 1,
        };

        progressTrackingSystem.updateProgress(userId, session);
        
        // Manually set streak to 3 days (less than 7)
        const progress = progressTrackingSystem.getProgress(userId);
        progress.streakDays = 3;

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should NOT include streak-7 badge (but might include streak-3)
        return !newBadges.includes('streak-7');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should award formula-mastery badge when user completes enough jigsaws', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session
        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'periodicTableJigsaw',
          gradeLevel: 5,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 100,
          answers: [{
            elementId: 'H',
            userAnswer: 'H',
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          }],
          correctCount: 1,
          totalCount: 1,
        };

        progressTrackingSystem.updateProgress(userId, session);
        
        // Manually set jigsawPuzzlesCompleted to 1
        const progress = progressTrackingSystem.getProgress(userId);
        progress.jigsawPuzzlesCompleted = 1;

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should include formula-mastery badge
        return newBadges.includes('formula-mastery');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should not award formula-mastery badge when user has not completed jigsaws', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session
        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'periodicTableJigsaw',
          gradeLevel: 5,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 100,
          answers: [{
            elementId: 'H',
            userAnswer: 'H',
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          }],
          correctCount: 1,
          totalCount: 1,
        };

        progressTrackingSystem.updateProgress(userId, session);
        
        // jigsawPuzzlesCompleted is 0 by default

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should NOT include formula-mastery badge
        return !newBadges.includes('formula-mastery');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should not award already-awarded badges', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session with 15 correct answers
        const answers = [];
        for (let i = 0; i < 15; i++) {
          const symbol = String.fromCharCode(65 + i);
          answers.push({
            elementId: symbol,
            userAnswer: symbol,
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          });
        }

        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 100,
          answers,
          correctCount: 15,
          totalCount: 15,
        };

        progressTrackingSystem.updateProgress(userId, session);
        
        // Manually add the badge to the user's progress
        const progress = progressTrackingSystem.getProgress(userId);
        progress.badges.push('elements-15');

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should NOT include elements-15 in newly unlocked badges (already has it)
        return !newBadges.includes('elements-15');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should award multiple badges when user meets multiple criteria', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session with 25 correct answers (for elements-25)
        const answers = [];
        for (let i = 0; i < 25; i++) {
          const symbol = String.fromCharCode(65 + (i % 26));
          answers.push({
            elementId: symbol,
            userAnswer: symbol,
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          });
        }

        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 5,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 100,
          answers,
          correctCount: 25,
          totalCount: 25,
        };

        progressTrackingSystem.updateProgress(userId, session);
        
        // Manually set accuracy to 80% and streak to 7
        const progress = progressTrackingSystem.getProgress(userId);
        progress.averageAccuracy = 80;
        progress.streakDays = 7;

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should include multiple badges
        const hasElementsBadge = newBadges.includes('elements-25');
        const hasAccuracyBadge = newBadges.includes('accuracy-80');
        const hasStreakBadge = newBadges.includes('streak-7');

        return hasElementsBadge && hasAccuracyBadge && hasStreakBadge;
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should handle edge case of exactly meeting threshold', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session with 7 correct out of 10 (exactly 70%)
        const answers = [];
        for (let i = 0; i < 10; i++) {
          answers.push({
            elementId: String.fromCharCode(65 + i),
            userAnswer: String.fromCharCode(65 + i),
            correct: i < 7,
            responseTime: 1000,
            timestamp: Date.now(),
          });
        }

        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 70,
          answers,
          correctCount: 7,
          totalCount: 10,
        };

        progressTrackingSystem.updateProgress(userId, session);

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should include accuracy-70 badge (exactly at threshold should qualify)
        return newBadges.includes('accuracy-70');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should handle edge case of just below threshold', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session with 69% accuracy (just below 70%)
        const answers = [];
        for (let i = 0; i < 100; i++) {
          answers.push({
            elementId: String.fromCharCode(65 + (i % 26)),
            userAnswer: String.fromCharCode(65 + (i % 26)),
            correct: i < 69, // 69 correct out of 100 = 69%
            responseTime: 1000,
            timestamp: Date.now(),
          });
        }

        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 69,
          answers,
          correctCount: 69,
          totalCount: 100,
        };

        progressTrackingSystem.updateProgress(userId, session);

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should NOT include accuracy-70 badge (below threshold)
        return !newBadges.includes('accuracy-70');
      });

      fc.assert(property, { numRuns: 20 });
    });

    it('should maintain consistency across multiple badge checks', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a simple session
        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 100,
          answers: [{
            elementId: 'H',
            userAnswer: 'H',
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          }],
          correctCount: 1,
          totalCount: 1,
        };

        progressTrackingSystem.updateProgress(userId, session);

        // Check badge criteria multiple times
        const badges1 = rewardSystem.checkBadgeCriteria(userId, session);
        const badges2 = rewardSystem.checkBadgeCriteria(userId, session);
        const badges3 = rewardSystem.checkBadgeCriteria(userId, session);

        // All checks should return the same result
        return (
          JSON.stringify(badges1.sort()) === JSON.stringify(badges2.sort()) &&
          JSON.stringify(badges2.sort()) === JSON.stringify(badges3.sort())
        );
      });

      fc.assert(property, { numRuns: 30 });
    });

    it('should correctly evaluate all badge types', () => {
      const property = fc.property(userIdArbitrary, (userId) => {
        // Create a session with 30 correct answers
        const answers = [];
        for (let i = 0; i < 30; i++) {
          const symbol = String.fromCharCode(65 + (i % 26));
          answers.push({
            elementId: symbol,
            userAnswer: symbol,
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          });
        }

        const session: GameSession = {
          sessionId: 'test-session',
          gameType: 'periodicTableJigsaw',
          gradeLevel: 6,
          difficulty: 'hard',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 100,
          answers,
          correctCount: 30,
          totalCount: 30,
        };

        progressTrackingSystem.updateProgress(userId, session);
        
        // Manually set other criteria
        const progress = progressTrackingSystem.getProgress(userId);
        progress.streakDays = 30;
        progress.jigsawPuzzlesCompleted = 1;

        const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

        // Should include badges from all types
        const badgeIds = new Set(newBadges);
        const hasElementsBadge = badgeIds.has('elements-30');
        const hasAccuracyBadge = badgeIds.has('accuracy-90');
        const hasStreakBadge = badgeIds.has('streak-30');
        const hasFormulaBadge = badgeIds.has('formula-mastery');

        return hasElementsBadge && hasAccuracyBadge && hasStreakBadge && hasFormulaBadge;
      });

      fc.assert(property, { numRuns: 20 });
    });
  });
});
