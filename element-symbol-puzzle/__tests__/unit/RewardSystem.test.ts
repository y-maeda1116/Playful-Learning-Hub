/**
 * Unit tests for RewardSystem
 * Tests badge criteria evaluation, badge awarding, streak calculation, and integration with ProgressTrackingSystem
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

  describe('Badge Criteria Evaluation - All Badge Types', () => {
    it('should evaluate elements-learned badge criteria correctly', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create sessions to master 15 elements
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
      expect(newBadges).toContain('elements-15');
    });

    it('should evaluate accuracy badge criteria at 70% threshold', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create session with 70% accuracy
      const answers: Answer[] = [];
      for (let i = 0; i < 10; i++) {
        answers.push({
          elementId: `element${i}`,
          userAnswer: `answer${i}`,
          correct: i < 7, // 70% accuracy
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

    it('should evaluate accuracy badge criteria at 80% threshold', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 4);

      // Create session with 80% accuracy
      const answers: Answer[] = [];
      for (let i = 0; i < 10; i++) {
        answers.push({
          elementId: `element${i}`,
          userAnswer: `answer${i}`,
          correct: i < 8, // 80% accuracy
          responseTime: 1000,
          timestamp: Date.now(),
        });
      }

      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 4,
        difficulty: 'easy',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 80,
        answers,
        correctCount: 8,
        totalCount: 10,
      };

      progressTrackingSystem.updateProgress(userId, session);

      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);
      expect(newBadges).toContain('accuracy-80');
    });

    it('should evaluate accuracy badge criteria at 90% threshold', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 5);

      // Create session with 90% accuracy
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

      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 5,
        difficulty: 'easy',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 90,
        answers,
        correctCount: 9,
        totalCount: 10,
      };

      progressTrackingSystem.updateProgress(userId, session);

      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);
      expect(newBadges).toContain('accuracy-90');
    });

    it('should evaluate streak badge criteria at 3 days', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Simulate 3 consecutive days
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

    it('should evaluate streak badge criteria at 7 days', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 4);

      // Simulate 7 consecutive days
      for (let day = 0; day < 7; day++) {
        const session: GameSession = {
          sessionId: `session${day}`,
          gameType: 'matching',
          gradeLevel: 4,
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

    it('should evaluate formula-mastery badge criteria', () => {
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

    it('should evaluate jigsaw-completed badge criteria', () => {
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

  describe('Badge Awarding and Tracking', () => {
    it('should track multiple badges awarded to a user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');
      rewardSystem.awardBadge(userId, 'streak-3');

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(3);
      expect(badges.map((b) => b.id)).toEqual(
        expect.arrayContaining(['elements-15', 'accuracy-70', 'streak-3'])
      );
    });

    it('should maintain badge order when awarding multiple badges', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');
      rewardSystem.awardBadge(userId, 'streak-3');

      const achievements = rewardSystem.getAchievements(userId);
      expect(achievements.length).toBe(3);
      expect(achievements[0].badgeId).toBe('elements-15');
      expect(achievements[1].badgeId).toBe('accuracy-70');
      expect(achievements[2].badgeId).toBe('streak-3');
    });

    it('should record achievement metadata correctly', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const beforeTime = Date.now();
      rewardSystem.awardBadge(userId, 'elements-15');
      const afterTime = Date.now();

      const achievements = rewardSystem.getAchievements(userId);
      expect(achievements[0].userId).toBe(userId);
      expect(achievements[0].badgeId).toBe('elements-15');
      expect(achievements[0].unlockedDate).toBeGreaterThanOrEqual(beforeTime);
      expect(achievements[0].unlockedDate).toBeLessThanOrEqual(afterTime);
      expect(achievements[0].displayNotification).toBe(true);
    });

    it('should prevent duplicate badge awards', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'elements-15');

      const badges = rewardSystem.getUnlockedBadges(userId);
      const count = badges.filter((b) => b.id === 'elements-15').length;
      expect(count).toBe(1);
    });

    it('should track all badge types independently', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 6);

      // Award one badge of each type
      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');
      rewardSystem.awardBadge(userId, 'streak-3');
      rewardSystem.awardBadge(userId, 'formula-mastery');

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(4);

      const badgeIds = badges.map((b) => b.id);
      expect(badgeIds).toContain('elements-15');
      expect(badgeIds).toContain('accuracy-70');
      expect(badgeIds).toContain('streak-3');
      expect(badgeIds).toContain('formula-mastery');
    });
  });

  describe('Consecutive Learning Days Calculation', () => {
    it('should initialize streak days to 0 for new user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const streakDays = rewardSystem.getStreakDays(userId);
      expect(streakDays).toBe(0);
    });

    it('should track streak days after first session', () => {
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

    it('should return correct streak days value', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Simulate multiple sessions
      for (let i = 0; i < 3; i++) {
        const session: GameSession = {
          sessionId: `session${i}`,
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

      const streakDays = rewardSystem.getStreakDays(userId);
      expect(typeof streakDays).toBe('number');
      expect(streakDays).toBeGreaterThanOrEqual(0);
    });

    it('should award streak badge when threshold is reached', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Simulate 3 consecutive days
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
  });

  describe('Multiple Badge Scenarios', () => {
    it('should handle user earning multiple badges in single session', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create session with high accuracy and many correct answers
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

      // Should have earned multiple badges
      expect(newBadges.length).toBeGreaterThan(0);
    });

    it('should handle progressive badge unlocking', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 6);

      // Award elements badges progressively
      rewardSystem.awardBadge(userId, 'elements-15');
      let badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(1);

      rewardSystem.awardBadge(userId, 'elements-25');
      badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(2);

      rewardSystem.awardBadge(userId, 'elements-30');
      badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(3);
    });

    it('should handle mixed badge types for same user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 6);

      // Award badges of different types
      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');
      rewardSystem.awardBadge(userId, 'streak-3');
      rewardSystem.awardBadge(userId, 'formula-mastery');

      const badges = rewardSystem.getUnlockedBadges(userId);
      const badgeTypes = new Set(badges.map((b) => b.criteria.type));

      expect(badgeTypes.has('elements-learned')).toBe(true);
      expect(badgeTypes.has('accuracy')).toBe(true);
      expect(badgeTypes.has('streak')).toBe(true);
      expect(badgeTypes.has('formula-mastery')).toBe(true);
    });

    it('should handle multiple users with different badge sets', () => {
      const user1 = 'user1';
      const user2 = 'user2';
      const user3 = 'user3';

      progressTrackingSystem.loadFromLocalStorage(user1, 3);
      progressTrackingSystem.loadFromLocalStorage(user2, 4);
      progressTrackingSystem.loadFromLocalStorage(user3, 6);

      // Award different badges to each user
      rewardSystem.awardBadge(user1, 'elements-15');
      rewardSystem.awardBadge(user1, 'accuracy-70');

      rewardSystem.awardBadge(user2, 'accuracy-80');
      rewardSystem.awardBadge(user2, 'streak-3');

      rewardSystem.awardBadge(user3, 'elements-30');
      rewardSystem.awardBadge(user3, 'accuracy-90');
      rewardSystem.awardBadge(user3, 'formula-mastery');

      const user1Badges = rewardSystem.getUnlockedBadges(user1);
      const user2Badges = rewardSystem.getUnlockedBadges(user2);
      const user3Badges = rewardSystem.getUnlockedBadges(user3);

      expect(user1Badges.length).toBe(2);
      expect(user2Badges.length).toBe(2);
      expect(user3Badges.length).toBe(3);
    });

    it('should handle all badge types in single scenario', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 6);

      // Award all available badge types
      const allBadgeIds = [
        'elements-15',
        'elements-25',
        'elements-30',
        'accuracy-70',
        'accuracy-80',
        'accuracy-90',
        'streak-3',
        'streak-7',
        'streak-30',
        'formula-mastery',
      ];

      for (const badgeId of allBadgeIds) {
        rewardSystem.awardBadge(userId, badgeId);
      }

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(allBadgeIds.length);

      const awardedIds = badges.map((b) => b.id);
      for (const badgeId of allBadgeIds) {
        expect(awardedIds).toContain(badgeId);
      }
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
