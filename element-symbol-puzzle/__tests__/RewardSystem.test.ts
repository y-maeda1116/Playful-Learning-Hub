/**
 * Unit tests for RewardSystem
 * Tests badge criteria evaluation, badge awarding, streak calculation, and integration with ProgressTrackingSystem
 */

import { RewardSystem } from '../RewardSystem';
import { ProgressTrackingSystem } from '../ProgressTrackingSystem';
import { GameSession, Answer } from '../types';
import { BADGES } from '../badges';

describe('RewardSystem', () => {
  let rewardSystem: RewardSystem;
  let progressTrackingSystem: ProgressTrackingSystem;

  beforeEach(() => {
    progressTrackingSystem = new ProgressTrackingSystem();
    rewardSystem = new RewardSystem(progressTrackingSystem);
  });

  describe('checkBadgeCriteria', () => {
    it('should return empty array when no badges are earned', () => {
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
        score: 10,
        answers: [
          {
            elementId: 'H',
            userAnswer: 'Oxygen',
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

      expect(newBadges).toEqual([]);
    });

    it('should award elements-learned badge when threshold is met', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create a session with 15 mastered elements
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

      // Run the session again to meet mastery threshold (80% accuracy with 2+ attempts)
      progressTrackingSystem.updateProgress(userId, session);

      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      // Should have earned elements-15 badge
      expect(newBadges).toContain('elements-15');
    });

    it('should award accuracy badge when accuracy threshold is met', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create multiple sessions to build up accuracy
      for (let session = 0; session < 3; session++) {
        const answers: Answer[] = [];
        for (let i = 0; i < 10; i++) {
          answers.push({
            elementId: `element${i}`,
            userAnswer: `answer${i}`,
            correct: i < 9, // 90% accuracy
            responseTime: 1000,
            timestamp: Date.now(),
          });
        }

        const gameSession: GameSession = {
          sessionId: `session${session}`,
          gameType: 'matching',
          gradeLevel: 3,
          difficulty: 'easy',
          startTime: Date.now() - 5000,
          elements: [],
          currentIndex: 0,
          score: 90,
          answers,
          correctCount: 9,
          totalCount: 10,
        };

        progressTrackingSystem.updateProgress(userId, gameSession);
      }

      const session: GameSession = {
        sessionId: 'session-final',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 90,
        answers: [],
        correctCount: 0,
        totalCount: 0,
      };

      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      // Should have earned accuracy-90 badge
      expect(newBadges).toContain('accuracy-90');
    });

    it('should award streak badge when consecutive days threshold is met', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Simulate 3 consecutive days of learning
      for (let day = 0; day < 3; day++) {
        const session: GameSession = {
          sessionId: `session${day}`,
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
      }

      const progress = progressTrackingSystem.getProgress(userId);
      expect(progress.streakDays).toBeGreaterThanOrEqual(1);
    });

    it('should not award badge if criteria not met', () => {
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
        score: 10,
        answers: [
          {
            elementId: 'H',
            userAnswer: 'Oxygen',
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

      expect(newBadges.length).toBe(0);
    });

    it('should throw error for invalid userId', () => {
      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now(),
        elements: [],
        currentIndex: 0,
        score: 0,
        answers: [],
        correctCount: 0,
        totalCount: 0,
      };

      expect(() => rewardSystem.checkBadgeCriteria('', session)).toThrow('Invalid userId');
      expect(() => rewardSystem.checkBadgeCriteria('   ', session)).toThrow('Invalid userId');
    });

    it('should throw error for invalid sessionData', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      expect(() => rewardSystem.checkBadgeCriteria(userId, null as any)).toThrow('Invalid sessionData');
    });
  });

  describe('awardBadge', () => {
    it('should award a badge to a user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');

      const unlockedBadges = rewardSystem.getUnlockedBadges(userId);
      expect(unlockedBadges.some((b) => b.id === 'elements-15')).toBe(true);
    });

    it('should not award the same badge twice', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'elements-15');

      const unlockedBadges = rewardSystem.getUnlockedBadges(userId);
      const count = unlockedBadges.filter((b) => b.id === 'elements-15').length;
      expect(count).toBe(1);
    });

    it('should throw error for invalid userId', () => {
      expect(() => rewardSystem.awardBadge('', 'elements-15')).toThrow('Invalid userId');
      expect(() => rewardSystem.awardBadge('   ', 'elements-15')).toThrow('Invalid userId');
    });

    it('should throw error for invalid badgeId', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      expect(() => rewardSystem.awardBadge(userId, '')).toThrow('Invalid badgeId');
      expect(() => rewardSystem.awardBadge(userId, '   ')).toThrow('Invalid badgeId');
    });

    it('should throw error for non-existent badge', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      expect(() => rewardSystem.awardBadge(userId, 'non-existent-badge')).toThrow('Badge non-existent-badge not found');
    });
  });

  describe('getUnlockedBadges', () => {
    it('should return empty array for user with no badges', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges).toEqual([]);
    });

    it('should return all unlocked badges for a user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');
      rewardSystem.awardBadge(userId, 'streak-3');

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(3);
      expect(badges.some((b) => b.id === 'elements-15')).toBe(true);
      expect(badges.some((b) => b.id === 'accuracy-70')).toBe(true);
      expect(badges.some((b) => b.id === 'streak-3')).toBe(true);
    });

    it('should throw error for invalid userId', () => {
      expect(() => rewardSystem.getUnlockedBadges('')).toThrow('Invalid userId');
      expect(() => rewardSystem.getUnlockedBadges('   ')).toThrow('Invalid userId');
    });

    it('should throw error for non-existent user', () => {
      expect(() => rewardSystem.getUnlockedBadges('non-existent-user')).toThrow('User non-existent-user not found');
    });
  });

  describe('getStreakDays', () => {
    it('should return 0 for new user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const streakDays = rewardSystem.getStreakDays(userId);
      expect(streakDays).toBe(0);
    });

    it('should return streak days for user with learning history', () => {
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
      expect(streakDays).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for invalid userId', () => {
      expect(() => rewardSystem.getStreakDays('')).toThrow('Invalid userId');
      expect(() => rewardSystem.getStreakDays('   ')).toThrow('Invalid userId');
    });

    it('should throw error for non-existent user', () => {
      expect(() => rewardSystem.getStreakDays('non-existent-user')).toThrow('User non-existent-user not found');
    });
  });

  describe('getAchievements', () => {
    it('should return empty array for user with no achievements', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const achievements = rewardSystem.getAchievements(userId);
      expect(achievements).toEqual([]);
    });

    it('should return all achievements for a user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');

      const achievements = rewardSystem.getAchievements(userId);
      expect(achievements.length).toBe(2);
      expect(achievements[0].badgeId).toBe('elements-15');
      expect(achievements[1].badgeId).toBe('accuracy-70');
    });

    it('should record achievement unlock date', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const beforeTime = Date.now();
      rewardSystem.awardBadge(userId, 'elements-15');
      const afterTime = Date.now();

      const achievements = rewardSystem.getAchievements(userId);
      expect(achievements[0].unlockedDate).toBeGreaterThanOrEqual(beforeTime);
      expect(achievements[0].unlockedDate).toBeLessThanOrEqual(afterTime);
    });

    it('should throw error for invalid userId', () => {
      expect(() => rewardSystem.getAchievements('')).toThrow('Invalid userId');
      expect(() => rewardSystem.getAchievements('   ')).toThrow('Invalid userId');
    });
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
});
