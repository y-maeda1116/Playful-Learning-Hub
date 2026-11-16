/**
 * Unit tests for RewardSystem - integration and edge cases
 * Split from RewardSystem.test.ts (issue #37). Test code moved unedited.
 */


import { RewardSystem } from '../../src/core/RewardSystem';
import { ProgressTrackingSystem } from '../../src/core/ProgressTrackingSystem';
import { GameSession, Answer } from '../../src/data/types';
import { BADGES } from '../../src/data/badges';
describe('RewardSystem', () => {
  let rewardSystem: RewardSystem;
  let progressTrackingSystem: ProgressTrackingSystem;

  beforeEach(() => {
    progressTrackingSystem = new ProgressTrackingSystem();
    rewardSystem = new RewardSystem(progressTrackingSystem);
  });

  describe('Integration with ProgressTrackingSystem', () => {
    it('should correctly evaluate badge criteria based on progress', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create a session with correct answers
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

      progressTrackingSystem.updateProgress(userId, session);
      progressTrackingSystem.updateProgress(userId, session);

      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      // Should have earned elements-15 badge
      expect(newBadges.length).toBeGreaterThan(0);
    });

    it('should handle multiple users independently', () => {
      const user1 = 'user1';
      const user2 = 'user2';

      progressTrackingSystem.loadFromLocalStorage(user1, 3);
      progressTrackingSystem.loadFromLocalStorage(user2, 3);

      rewardSystem.awardBadge(user1, 'elements-15');

      const user1Badges = rewardSystem.getUnlockedBadges(user1);
      const user2Badges = rewardSystem.getUnlockedBadges(user2);

      expect(user1Badges.length).toBe(1);
      expect(user2Badges.length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle formula-mastery badge criteria', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 6);

      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'chemicalFormula',
        gradeLevel: 6,
        difficulty: 'hard',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 100,
        answers: [],
        correctCount: 0,
        totalCount: 0,
      };

      // This should not throw an error
      expect(() => rewardSystem.checkBadgeCriteria(userId, session)).not.toThrow();
    });

    it('should handle jigsaw-completed badge criteria', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 6);

      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'periodicTableJigsaw',
        gradeLevel: 6,
        difficulty: 'hard',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 100,
        answers: [],
        correctCount: 0,
        totalCount: 0,
      };

      // This should not throw an error
      expect(() => rewardSystem.checkBadgeCriteria(userId, session)).not.toThrow();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty badge list for new user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(Array.isArray(badges)).toBe(true);
      expect(badges.length).toBe(0);
    });

    it('should handle achievements list for user with no badges', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const achievements = rewardSystem.getAchievements(userId);
      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBe(0);
    });

    it('should handle badge criteria check with zero accuracy', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 0,
        answers: [
          {
            elementId: 'H',
            userAnswer: 'Wrong',
            correct: false,
            responseTime: 1000,
            timestamp: Date.now(),
          },
        ],
        correctCount: 0,
        totalCount: 1,
      };

      progressTrackingSystem.updateProgress(userId, session);
      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      expect(Array.isArray(newBadges)).toBe(true);
      expect(newBadges.length).toBe(0);
    });

    it('should handle badge criteria check with 100% accuracy', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const answers: Answer[] = [];
      for (let i = 0; i < 10; i++) {
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
        correctCount: 10,
        totalCount: 10,
      };

      progressTrackingSystem.updateProgress(userId, session);
      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      expect(Array.isArray(newBadges)).toBe(true);
    });

    it('should handle checking badges for user with existing badges', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Award a badge first
      rewardSystem.awardBadge(userId, 'elements-15');

      // Check criteria again - should not re-award
      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 100,
        answers: [],
        correctCount: 0,
        totalCount: 0,
      };

      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      // Should not include already awarded badge
      expect(newBadges).not.toContain('elements-15');
    });

    it('should handle very high accuracy values', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 5);

      // Create session with 100% accuracy across many answers
      const answers: Answer[] = [];
      for (let i = 0; i < 50; i++) {
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
        gradeLevel: 5,
        difficulty: 'hard',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 100,
        answers,
        correctCount: 50,
        totalCount: 50,
      };

      progressTrackingSystem.updateProgress(userId, session);

      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);
      expect(Array.isArray(newBadges)).toBe(true);
    });

    it('should handle boundary accuracy values', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Test with exactly 70% accuracy
      const answers: Answer[] = [];
      for (let i = 0; i < 10; i++) {
        answers.push({
          elementId: `element${i}`,
          userAnswer: `answer${i}`,
          correct: i < 7, // Exactly 70%
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
        score: 70,
        answers,
        correctCount: 7,
        totalCount: 10,
      };

      progressTrackingSystem.updateProgress(userId, session);
      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      expect(newBadges).toContain('accuracy-70');
    });
  });
});
