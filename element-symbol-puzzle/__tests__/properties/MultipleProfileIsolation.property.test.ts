/**
 * Property-Based Tests for Multiple Profile Isolation
 * 
 * Tests universal properties that must hold across all inputs
 * using fast-check for property-based testing.
 * 
 * Validates that multiple user profiles maintain data isolation,
 * ensuring that updates to one profile do not affect other profiles.
 */

import * as fc from 'fast-check';
import { ProgressTrackingSystem } from '../../src/core/ProgressTrackingSystem';
import { StorageAdapter } from '../../src/core/StorageAdapter';
import { GameSession, Answer } from '../../src/data/types';

describe('Multiple Profile Isolation - Property-Based Tests', () => {
  let progressTrackingSystem: ProgressTrackingSystem;
  let storageAdapter: StorageAdapter;

  beforeEach(() => {
    progressTrackingSystem = new ProgressTrackingSystem();
    storageAdapter = new StorageAdapter();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    progressTrackingSystem.clearAllProgress();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
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

  const elementIdArbitrary = fc.stringMatching(/^[A-Z][a-z]?$/);

  const answerArbitrary = fc.record({
    elementId: elementIdArbitrary,
    userAnswer: fc.string({ minLength: 1, maxLength: 20 }),
    correct: fc.boolean(),
    responseTime: fc.integer({ min: 100, max: 5000 }),
    timestamp: fc.integer({ min: 0, max: Date.now() }),
  });

  const gameSessionArbitrary = fc.record({
    sessionId: fc.stringMatching(/^session[0-9]{1,3}$/),
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
    startTime: fc.integer({ min: 0, max: Date.now() - 5000 }),
    elements: fc.constant([]),
    currentIndex: fc.integer({ min: 0, max: 10 }),
    score: fc.integer({ min: 0, max: 1000 }),
    answers: fc.array(answerArbitrary, { minLength: 1, maxLength: 20 }),
    correctCount: fc.integer({ min: 0, max: 20 }),
    totalCount: fc.integer({ min: 1, max: 20 }),
  });

  describe('Property 9: Multiple Profile Isolation', () => {
    /**
     * **Validates: Requirements 4.5, 8.2**
     * 
     * Property: For any two different user profiles, when one profile's progress
     * is updated, the other profile's data SHALL remain unchanged.
     * 
     * This ensures that:
     * - User data is properly isolated
     * - Updates to one user don't affect other users
     * - Multiple profiles can coexist without interference
     * - Profile switching maintains data integrity
     */
    it('should maintain data isolation between different user profiles', () => {
      const property = fc.property(
        userIdArbitrary,
        userIdArbitrary,
        gameSessionArbitrary,
        gameSessionArbitrary,
        (userId1, userId2, session1, session2) => {
          // Ensure different user IDs
          fc.pre(userId1 !== userId2);

          // Initialize both users
          progressTrackingSystem.loadFromLocalStorage(userId1, 3);
          progressTrackingSystem.loadFromLocalStorage(userId2, 4);

          // Get initial state of user2
          const user2InitialProgress = progressTrackingSystem.getProgress(userId2);
          const user2InitialSessionCount = user2InitialProgress.sessionCount;
          const user2InitialAccuracy = user2InitialProgress.averageAccuracy;
          const user2InitialBadges = [...user2InitialProgress.badges];

          // Update user1's progress
          progressTrackingSystem.updateProgress(userId1, session1);

          // Get user2's progress after user1 update
          const user2AfterUpdate = progressTrackingSystem.getProgress(userId2);

          // User2's data should be unchanged
          return (
            user2AfterUpdate.sessionCount === user2InitialSessionCount &&
            user2AfterUpdate.averageAccuracy === user2InitialAccuracy &&
            JSON.stringify(user2AfterUpdate.badges) === JSON.stringify(user2InitialBadges)
          );
        },
      );

      fc.assert(property, { numRuns: 50 });
    });

    /**
     * Property: For any two different user profiles, when one profile's progress
     * is updated multiple times, the other profile's data SHALL remain unchanged.
     * 
     * This ensures that:
     * - Multiple updates to one user don't affect others
     * - Data isolation is maintained across multiple operations
     * - Cumulative updates don't leak between profiles
     */
    it('should maintain isolation through multiple updates to one profile', () => {
      const property = fc.property(
        userIdArbitrary,
        userIdArbitrary,
        fc.array(gameSessionArbitrary, { minLength: 1, maxLength: 5 }),
        (userId1, userId2, sessions) => {
          // Ensure different user IDs
          fc.pre(userId1 !== userId2);

          // Initialize both users
          progressTrackingSystem.loadFromLocalStorage(userId1, 3);
          progressTrackingSystem.loadFromLocalStorage(userId2, 4);

          // Get initial state of user2
          const user2InitialProgress = progressTrackingSystem.getProgress(userId2);
          const user2InitialSessionCount = user2InitialProgress.sessionCount;
          const user2InitialElements = JSON.stringify(user2InitialProgress.elementsLearned);

          // Update user1 multiple times
          for (const session of sessions) {
            progressTrackingSystem.updateProgress(userId1, session);
          }

          // Get user2's progress after multiple user1 updates
          const user2AfterUpdates = progressTrackingSystem.getProgress(userId2);

          // User2's data should be unchanged
          return (
            user2AfterUpdates.sessionCount === user2InitialSessionCount &&
            JSON.stringify(user2AfterUpdates.elementsLearned) === user2InitialElements
          );
        },
      );

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any two different user profiles, when both profiles are
     * updated, each profile's data SHALL reflect only its own updates.
     * 
     * This ensures that:
     * - Each user's updates are tracked independently
     * - Updates don't get mixed between users
     * - Session counts are accurate per user
     */
    it('should track updates independently for different profiles', () => {
      const property = fc.property(
        userIdArbitrary,
        userIdArbitrary,
        gameSessionArbitrary,
        gameSessionArbitrary,
        (userId1, userId2, session1, session2) => {
          // Ensure different user IDs
          fc.pre(userId1 !== userId2);

          // Initialize both users
          progressTrackingSystem.loadFromLocalStorage(userId1, 3);
          progressTrackingSystem.loadFromLocalStorage(userId2, 4);

          // Update both users
          progressTrackingSystem.updateProgress(userId1, session1);
          progressTrackingSystem.updateProgress(userId2, session2);

          // Get both users' progress
          const user1Progress = progressTrackingSystem.getProgress(userId1);
          const user2Progress = progressTrackingSystem.getProgress(userId2);

          // Both should have exactly 1 session
          return user1Progress.sessionCount === 1 && user2Progress.sessionCount === 1;
        },
      );

      fc.assert(property, { numRuns: 50 });
    });

    /**
     * Property: For any two different user profiles, when one profile's data
     * is saved to and loaded from localStorage, the other profile's data in
     * localStorage SHALL remain unchanged.
     * 
     * This ensures that:
     * - Storage operations don't interfere between users
     * - Each user's storage key is independent
     * - Data persistence maintains isolation
     */
    it('should maintain storage isolation between different profiles', () => {
      const property = fc.property(
        userIdArbitrary,
        userIdArbitrary,
        gameSessionArbitrary,
        (userId1, userId2, session) => {
          // Ensure different user IDs
          fc.pre(userId1 !== userId2);

          // Initialize both users
          const user1Progress = progressTrackingSystem.loadFromLocalStorage(userId1, 3);
          const user2Progress = progressTrackingSystem.loadFromLocalStorage(userId2, 4);

          // Update user1
          progressTrackingSystem.updateProgress(userId1, session);

          // Save user1 to storage
          progressTrackingSystem.saveToLocalStorage(userId1);

          // Load user2 from storage
          const user2Loaded = progressTrackingSystem.loadFromLocalStorage(userId2, 4);

          if (typeof localStorage === 'undefined') {
            return true;
          }

          // User2's loaded data should match the initial state
          return (
            user2Loaded.userId === userId2 &&
            user2Loaded.sessionCount === user2Progress.sessionCount
          );
        },
      );

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any two different user profiles, when one profile's progress
     * is updated, the other profile's userId SHALL remain unchanged.
     * 
     * This ensures that:
     * - User identification is not affected by other users' updates
     * - Profile identity is maintained
     * - User separation is preserved
     */
    it('should preserve userId for all profiles during updates', () => {
      const property = fc.property(
        userIdArbitrary,
        userIdArbitrary,
        gameSessionArbitrary,
        (userId1, userId2, session) => {
          // Ensure different user IDs
          fc.pre(userId1 !== userId2);

          // Initialize both users
          progressTrackingSystem.loadFromLocalStorage(userId1, 3);
          progressTrackingSystem.loadFromLocalStorage(userId2, 4);

          // Get initial userIds
          const user1InitialId = progressTrackingSystem.getProgress(userId1).userId;
          const user2InitialId = progressTrackingSystem.getProgress(userId2).userId;

          // Update user1
          progressTrackingSystem.updateProgress(userId1, session);

          // Get userIds after update
          const user1FinalId = progressTrackingSystem.getProgress(userId1).userId;
          const user2FinalId = progressTrackingSystem.getProgress(userId2).userId;

          // All userIds should be preserved
          return (
            user1InitialId === user1FinalId &&
            user2InitialId === user2FinalId &&
            user1FinalId === userId1 &&
            user2FinalId === userId2
          );
        },
      );

      fc.assert(property, { numRuns: 50 });
    });

    /**
     * Property: For any two different user profiles, when one profile's progress
     * is updated, the other profile's gradeLevel SHALL remain unchanged.
     * 
     * This ensures that:
     * - Grade level information is not affected by other users' updates
     * - Student level tracking is independent
     * - Grade-appropriate content selection is preserved per user
     */
    it('should preserve gradeLevel for all profiles during updates', () => {
      const property = fc.property(
        userIdArbitrary,
        userIdArbitrary,
        gameSessionArbitrary,
        (userId1, userId2, session) => {
          // Ensure different user IDs
          fc.pre(userId1 !== userId2);

          // Initialize both users with different grade levels
          progressTrackingSystem.loadFromLocalStorage(userId1, 3);
          progressTrackingSystem.loadFromLocalStorage(userId2, 5);

          // Get initial grade levels
          const user1InitialGrade = progressTrackingSystem.getProgress(userId1).gradeLevel;
          const user2InitialGrade = progressTrackingSystem.getProgress(userId2).gradeLevel;

          // Update user1
          progressTrackingSystem.updateProgress(userId1, session);

          // Get grade levels after update
          const user1FinalGrade = progressTrackingSystem.getProgress(userId1).gradeLevel;
          const user2FinalGrade = progressTrackingSystem.getProgress(userId2).gradeLevel;

          // All grade levels should be preserved
          return (
            user1InitialGrade === user1FinalGrade &&
            user2InitialGrade === user2FinalGrade &&
            user1FinalGrade === 3 &&
            user2FinalGrade === 5
          );
        },
      );

      fc.assert(property, { numRuns: 50 });
    });

    /**
     * Property: For any two different user profiles, when one profile's progress
     * is updated, the other profile's elementsLearned data SHALL remain unchanged.
     * 
     * This ensures that:
     * - Element learning progress is tracked independently
     * - One user's learning doesn't affect another's
     * - Element mastery status is per-user
     */
    it('should maintain independent elementsLearned data for different profiles', () => {
      const property = fc.property(
        userIdArbitrary,
        userIdArbitrary,
        gameSessionArbitrary,
        (userId1, userId2, session) => {
          // Ensure different user IDs
          fc.pre(userId1 !== userId2);

          // Initialize both users
          progressTrackingSystem.loadFromLocalStorage(userId1, 3);
          progressTrackingSystem.loadFromLocalStorage(userId2, 4);

          // Get initial elementsLearned for user2
          const user2InitialElements = JSON.stringify(
            progressTrackingSystem.getProgress(userId2).elementsLearned,
          );

          // Update user1
          progressTrackingSystem.updateProgress(userId1, session);

          // Get elementsLearned for user2 after user1 update
          const user2FinalElements = JSON.stringify(
            progressTrackingSystem.getProgress(userId2).elementsLearned,
          );

          // User2's elements should be unchanged
          return user2InitialElements === user2FinalElements;
        },
      );

      fc.assert(property, { numRuns: 50 });
    });

    /**
     * Property: For any three different user profiles, when one profile is
     * updated, the other two profiles' data SHALL remain unchanged.
     * 
     * This ensures that:
     * - Isolation works with more than two profiles
     * - Multiple concurrent profiles don't interfere
     * - System scales to multiple users
     */
    it('should maintain isolation with three or more profiles', () => {
      const property = fc.property(
        userIdArbitrary,
        userIdArbitrary,
        userIdArbitrary,
        gameSessionArbitrary,
        (userId1, userId2, userId3, session) => {
          // Ensure different user IDs
          fc.pre(userId1 !== userId2 && userId2 !== userId3 && userId1 !== userId3);

          // Initialize all three users
          progressTrackingSystem.loadFromLocalStorage(userId1, 3);
          progressTrackingSystem.loadFromLocalStorage(userId2, 4);
          progressTrackingSystem.loadFromLocalStorage(userId3, 5);

          // Get initial state of users 2 and 3
          const user2InitialCount = progressTrackingSystem.getProgress(userId2).sessionCount;
          const user3InitialCount = progressTrackingSystem.getProgress(userId3).sessionCount;

          // Update user1
          progressTrackingSystem.updateProgress(userId1, session);

          // Get final state of users 2 and 3
          const user2FinalCount = progressTrackingSystem.getProgress(userId2).sessionCount;
          const user3FinalCount = progressTrackingSystem.getProgress(userId3).sessionCount;

          // Users 2 and 3 should be unchanged
          return user2InitialCount === user2FinalCount && user3InitialCount === user3FinalCount;
        },
      );

      fc.assert(property, { numRuns: 30 });
    });
  });
});
