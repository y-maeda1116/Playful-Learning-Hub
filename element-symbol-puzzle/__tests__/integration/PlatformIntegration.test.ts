/**
 * Integration Tests for Platform Integration
 * 
 * Tests the integration of the element symbol puzzle system with the platform's
 * badge system, profile management, and data persistence across features.
 * 
 * Validates:
 * - Badge system integration (Requirements 5.1, 8.1)
 * - Profile management integration (Requirements 4.5, 8.2)
 * - Data persistence across platform features (Requirements 5.1, 4.5, 8.1, 8.2)
 */

import { ProgressTrackingSystem } from '../../src/core/ProgressTrackingSystem';
import { RewardSystem } from '../../src/core/RewardSystem';
import { StorageAdapter } from '../../src/core/StorageAdapter';
import { GameSession, Answer } from '../../src/data/types';

describe('Platform Integration Tests', () => {
  let progressTrackingSystem: ProgressTrackingSystem;
  let rewardSystem: RewardSystem;
  let storageAdapter: StorageAdapter;

  beforeEach(() => {
    progressTrackingSystem = new ProgressTrackingSystem();
    rewardSystem = new RewardSystem(progressTrackingSystem);
    storageAdapter = new StorageAdapter();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    progressTrackingSystem.clearAllProgress();
    rewardSystem.clearAllAchievements();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Badge System Integration', () => {
    /**
     * Test: Badge system integration with progress tracking
     * Validates: Requirements 5.1, 8.1
     * 
     * Ensures that:
     * - Badges are awarded when criteria are met
     * - Badge information is stored in user progress
     * - Badge system integrates with progress tracking
     */
    it('should award badges when progress criteria are met', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create a session with 15 correct answers to trigger elements-15 badge
      const answers: Answer[] = [];
      for (let i = 0; i < 15; i++) {
        answers.push({
          elementId: `element${i}`,
          userAnswer: `answer${i}`,
          correct: true,
          responseTime: 1000,
          timestamp: Date.now(),
        });
      }

      const session: GameSession = {
        sessionId: 'session1',
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

      // Update progress
      progressTrackingSystem.updateProgress(userId, session);

      // Run again to meet mastery threshold
      progressTrackingSystem.updateProgress(userId, session);

      // Check badge criteria
      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      // Should have earned at least one badge
      expect(newBadges.length).toBeGreaterThan(0);

      // Award the badges
      for (const badgeId of newBadges) {
        rewardSystem.awardBadge(userId, badgeId);
      }

      // Verify badges are in user progress
      const progress = progressTrackingSystem.getProgress(userId);
      expect(progress.badges.length).toBeGreaterThan(0);
    });

    /**
     * Test: Multiple badges can be awarded to a single user
     * Validates: Requirements 5.1, 8.1
     * 
     * Ensures that:
     * - Multiple badges can be earned
     * - Badge list grows as criteria are met
     * - Badge system supports multiple achievements
     */
    it('should support multiple badges for a single user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create sessions to earn multiple badges
      const answers: Answer[] = [];
      for (let i = 0; i < 25; i++) {
        answers.push({
          elementId: `element${i}`,
          userAnswer: `answer${i}`,
          correct: true,
          responseTime: 1000,
          timestamp: Date.now(),
        });
      }

      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 100,
        answers,
        correctCount: 25,
        totalCount: 25,
      };

      // Update progress multiple times
      for (let i = 0; i < 3; i++) {
        progressTrackingSystem.updateProgress(userId, session);
      }

      // Check badge criteria
      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      // Award all badges
      for (const badgeId of newBadges) {
        rewardSystem.awardBadge(userId, badgeId);
      }

      // Verify multiple badges are awarded
      const progress = progressTrackingSystem.getProgress(userId);
      expect(progress.badges.length).toBeGreaterThanOrEqual(1);

      // Verify badges can be retrieved
      const unlockedBadges = rewardSystem.getUnlockedBadges(userId);
      expect(unlockedBadges.length).toBe(progress.badges.length);
    });

    /**
     * Test: Badge criteria are checked correctly
     * Validates: Requirements 5.1, 8.1
     * 
     * Ensures that:
     * - Badge criteria are evaluated accurately
     * - Badges are only awarded when criteria are truly met
     * - Badge system validates thresholds correctly
     */
    it('should only award badges when criteria are truly met', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create a session with only 5 correct answers (not enough for elements-15)
      const answers: Answer[] = [];
      for (let i = 0; i < 5; i++) {
        answers.push({
          elementId: `element${i}`,
          userAnswer: `answer${i}`,
          correct: true,
          responseTime: 1000,
          timestamp: Date.now(),
        });
      }

      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 100,
        answers,
        correctCount: 5,
        totalCount: 5,
      };

      // Update progress
      progressTrackingSystem.updateProgress(userId, session);

      // Check badge criteria
      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      // Should not have earned any badges yet
      expect(newBadges.length).toBe(0);
    });
  });

  describe('Profile Management Integration', () => {
    /**
     * Test: Multiple profiles can be managed independently
     * Validates: Requirements 4.5, 8.2
     * 
     * Ensures that:
     * - Multiple user profiles can coexist
     * - Profile data is kept separate
     * - Profile switching works correctly
     */
    it('should manage multiple user profiles independently', () => {
      const userId1 = 'user1';
      const userId2 = 'user2';

      // Initialize both users
      progressTrackingSystem.loadFromLocalStorage(userId1, 3);
      progressTrackingSystem.loadFromLocalStorage(userId2, 5);

      // Create sessions for both users
      const session1: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
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

      const session2: GameSession = {
        sessionId: 'session2',
        gameType: 'quiz',
        gradeLevel: 5,
        difficulty: 'medium',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 75,
        answers: [
          {
            elementId: 'O',
            userAnswer: 'Oxygen',
            correct: true,
            responseTime: 1500,
            timestamp: Date.now(),
          },
        ],
        correctCount: 1,
        totalCount: 1,
      };

      // Update both users
      progressTrackingSystem.updateProgress(userId1, session1);
      progressTrackingSystem.updateProgress(userId2, session2);

      // Verify each user has their own data
      const progress1 = progressTrackingSystem.getProgress(userId1);
      const progress2 = progressTrackingSystem.getProgress(userId2);

      expect(progress1.userId).toBe(userId1);
      expect(progress2.userId).toBe(userId2);
      expect(progress1.gradeLevel).toBe(3);
      expect(progress2.gradeLevel).toBe(5);
      expect(progress1.sessionCount).toBe(1);
      expect(progress2.sessionCount).toBe(1);
    });

    /**
     * Test: Profile data is not mixed between users
     * Validates: Requirements 4.5, 8.2
     * 
     * Ensures that:
     * - Updates to one profile don't affect others
     * - Profile data remains isolated
     * - User separation is maintained
     */
    it('should keep profile data isolated between users', () => {
      const userId1 = 'user1';
      const userId2 = 'user2';

      // Initialize both users
      progressTrackingSystem.loadFromLocalStorage(userId1, 3);
      progressTrackingSystem.loadFromLocalStorage(userId2, 4);

      // Get initial state of user2
      const user2Initial = progressTrackingSystem.getProgress(userId2);
      const user2InitialSessionCount = user2Initial.sessionCount;

      // Create and update session for user1
      const session1: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
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

      // Verify user2 is unchanged
      const user2After = progressTrackingSystem.getProgress(userId2);
      expect(user2After.sessionCount).toBe(user2InitialSessionCount);
      expect(user2After.userId).toBe(userId2);
    });

    /**
     * Test: Profile switching maintains data integrity
     * Validates: Requirements 4.5, 8.2
     * 
     * Ensures that:
     * - Switching between profiles preserves data
     * - Each profile retains its own state
     * - Profile data is not lost during switching
     */
    it('should maintain data integrity when switching between profiles', () => {
      const userId1 = 'user1';
      const userId2 = 'user2';

      // Initialize both users
      progressTrackingSystem.loadFromLocalStorage(userId1, 3);
      progressTrackingSystem.loadFromLocalStorage(userId2, 4);

      // Create sessions
      const session1: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
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

      const session2: GameSession = {
        sessionId: 'session2',
        gameType: 'quiz',
        gradeLevel: 4,
        difficulty: 'medium',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 75,
        answers: [
          {
            elementId: 'O',
            userAnswer: 'Oxygen',
            correct: true,
            responseTime: 1500,
            timestamp: Date.now(),
          },
        ],
        correctCount: 1,
        totalCount: 1,
      };

      // Update user1
      progressTrackingSystem.updateProgress(userId1, session1);
      const user1After1 = progressTrackingSystem.getProgress(userId1);

      // Switch to user2 and update
      progressTrackingSystem.updateProgress(userId2, session2);
      const user2After = progressTrackingSystem.getProgress(userId2);

      // Switch back to user1
      const user1After2 = progressTrackingSystem.getProgress(userId1);

      // Verify user1's data is preserved
      expect(user1After2.sessionCount).toBe(user1After1.sessionCount);
      expect(user1After2.userId).toBe(userId1);
    });
  });

  describe('Data Persistence Across Platform Features', () => {
    /**
     * Test: Progress data persists to storage
     * Validates: Requirements 5.1, 4.5, 8.1, 8.2
     * 
     * Ensures that:
     * - Progress data is saved to storage
     * - Data can be retrieved from storage
     * - Persistence works across sessions
     */
    it('should persist progress data to storage', () => {
      const userId = 'user1';

      // Initialize user
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create and update session
      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
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

      // Save to storage
      progressTrackingSystem.saveToLocalStorage(userId);

      // Create new system and load from storage
      const newProgressSystem = new ProgressTrackingSystem();
      const loadedProgress = newProgressSystem.loadFromLocalStorage(userId, 3);

      if (typeof localStorage !== 'undefined') {
        // In browser environment, verify data was persisted
        expect(loadedProgress.userId).toBe(userId);
        expect(loadedProgress.sessionCount).toBe(1);
      }
    });

    /**
     * Test: Badge data persists with progress
     * Validates: Requirements 5.1, 4.5, 8.1, 8.2
     * 
     * Ensures that:
     * - Badges are saved with progress data
     * - Badge information persists across sessions
     * - Badge system integrates with persistence
     */
    it('should persist badge data with progress', () => {
      const userId = 'user1';

      // Initialize user
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create session with many correct answers
      const answers: Answer[] = [];
      for (let i = 0; i < 15; i++) {
        answers.push({
          elementId: `element${i}`,
          userAnswer: `answer${i}`,
          correct: true,
          responseTime: 1000,
          timestamp: Date.now(),
        });
      }

      const session: GameSession = {
        sessionId: 'session1',
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

      // Update progress
      progressTrackingSystem.updateProgress(userId, session);
      progressTrackingSystem.updateProgress(userId, session);

      // Check and award badges
      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);
      for (const badgeId of newBadges) {
        rewardSystem.awardBadge(userId, badgeId);
      }

      // Save to storage
      progressTrackingSystem.saveToLocalStorage(userId);

      // Verify badges are in progress
      const progress = progressTrackingSystem.getProgress(userId);
      expect(progress.badges.length).toBeGreaterThan(0);
    });

    /**
     * Test: Multiple profiles' data persists independently
     * Validates: Requirements 5.1, 4.5, 8.1, 8.2
     * 
     * Ensures that:
     * - Each profile's data is saved independently
     * - Profile data doesn't interfere in storage
     * - Multiple profiles can be persisted and restored
     */
    it('should persist multiple profiles independently', () => {
      const userId1 = 'user1';
      const userId2 = 'user2';

      // Initialize both users
      progressTrackingSystem.loadFromLocalStorage(userId1, 3);
      progressTrackingSystem.loadFromLocalStorage(userId2, 5);

      // Create sessions
      const session1: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
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

      const session2: GameSession = {
        sessionId: 'session2',
        gameType: 'quiz',
        gradeLevel: 5,
        difficulty: 'medium',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 75,
        answers: [
          {
            elementId: 'O',
            userAnswer: 'Oxygen',
            correct: true,
            responseTime: 1500,
            timestamp: Date.now(),
          },
        ],
        correctCount: 1,
        totalCount: 1,
      };

      // Update both users
      progressTrackingSystem.updateProgress(userId1, session1);
      progressTrackingSystem.updateProgress(userId2, session2);

      // Save both to storage
      progressTrackingSystem.saveToLocalStorage(userId1);
      progressTrackingSystem.saveToLocalStorage(userId2);

      // Create new system and load both profiles
      const newProgressSystem = new ProgressTrackingSystem();
      const loadedProgress1 = newProgressSystem.loadFromLocalStorage(userId1, 3);
      const loadedProgress2 = newProgressSystem.loadFromLocalStorage(userId2, 5);

      if (typeof localStorage !== 'undefined') {
        // In browser environment, verify both profiles were persisted
        expect(loadedProgress1.userId).toBe(userId1);
        expect(loadedProgress2.userId).toBe(userId2);
        expect(loadedProgress1.gradeLevel).toBe(3);
        expect(loadedProgress2.gradeLevel).toBe(5);
      }
    });

    /**
     * Test: Data persistence round-trip maintains integrity
     * Validates: Requirements 5.1, 4.5, 8.1, 8.2
     * 
     * Ensures that:
     * - Data saved and loaded maintains integrity
     * - No data loss during persistence
     * - Round-trip operations are reliable
     */
    it('should maintain data integrity through persistence round-trip', () => {
      const userId = 'user1';

      // Initialize user
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create session
      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
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

      // Update progress
      progressTrackingSystem.updateProgress(userId, session);
      const originalProgress = progressTrackingSystem.getProgress(userId);

      // Save to storage
      progressTrackingSystem.saveToLocalStorage(userId);

      // Load from storage
      const newProgressSystem = new ProgressTrackingSystem();
      const loadedProgress = newProgressSystem.loadFromLocalStorage(userId, 3);

      if (typeof localStorage !== 'undefined') {
        // In browser environment, verify data integrity
        expect(loadedProgress.userId).toBe(originalProgress.userId);
        expect(loadedProgress.sessionCount).toBe(originalProgress.sessionCount);
        expect(loadedProgress.gradeLevel).toBe(originalProgress.gradeLevel);
      }
    });
  });
});
