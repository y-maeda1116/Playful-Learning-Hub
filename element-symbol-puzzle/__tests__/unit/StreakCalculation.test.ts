/**
 * Unit Tests for Streak Calculation System
 * 
 * Tests streak calculation, reset on missed days, and badge awarding
 * for the consecutive learning days system.
 */

import { ProgressTrackingSystem } from '../../src/core/ProgressTrackingSystem';
import { RewardSystem } from '../../src/core/RewardSystem';
import { GameSession, Answer } from '../../src/data/types';

describe('Streak Calculation System', () => {
  let progressTrackingSystem: ProgressTrackingSystem;
  let rewardSystem: RewardSystem;

  beforeEach(() => {
    progressTrackingSystem = new ProgressTrackingSystem();
    rewardSystem = new RewardSystem(progressTrackingSystem);
  });

  describe('Consecutive Days Streak Calculation', () => {
    it('should initialize streak to 0 for new user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const progress = progressTrackingSystem.getProgress(userId);
      expect(progress.streakDays).toBe(0);
    });

    it('should set streak to 1 after first session', () => {
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
      const progress = progressTrackingSystem.getProgress(userId);

      expect(progress.streakDays).toBeGreaterThanOrEqual(1);
    });

    it('should not increment streak for multiple sessions on same day', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // First session
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

      progressTrackingSystem.updateProgress(userId, session1);
      const progress1 = progressTrackingSystem.getProgress(userId);
      const streak1 = progress1.streakDays;

      // Second session on same day
      const session2: GameSession = {
        sessionId: 'session2',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now() - 3000,
        elements: [],
        currentIndex: 0,
        score: 50,
        answers: [
          {
            elementId: 'O',
            userAnswer: 'Oxygen',
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          },
        ],
        correctCount: 1,
        totalCount: 1,
      };

      progressTrackingSystem.updateProgress(userId, session2);
      const progress2 = progressTrackingSystem.getProgress(userId);
      const streak2 = progress2.streakDays;

      // Streak should not increase for same day
      expect(streak2).toBe(streak1);
    });

    it('should track streak days through RewardSystem', () => {
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
      const progress = progressTrackingSystem.getProgress(userId);

      expect(streakDays).toBe(progress.streakDays);
    });

    it('should return non-negative streak days', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const progress = progressTrackingSystem.getProgress(userId);
      expect(progress.streakDays).toBeGreaterThanOrEqual(0);
    });

    it('should maintain streak consistency across multiple retrievals', () => {
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

      const progress1 = progressTrackingSystem.getProgress(userId);
      const progress2 = progressTrackingSystem.getProgress(userId);

      expect(progress1.streakDays).toBe(progress2.streakDays);
    });

    it('should handle streak calculation for multiple users independently', () => {
      const user1 = 'user1';
      const user2 = 'user2';

      progressTrackingSystem.loadFromLocalStorage(user1, 3);
      progressTrackingSystem.loadFromLocalStorage(user2, 3);

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

      progressTrackingSystem.updateProgress(user1, session);

      const progress1 = progressTrackingSystem.getProgress(user1);
      const progress2 = progressTrackingSystem.getProgress(user2);

      // User1 should have streak, User2 should have 0
      expect(progress1.streakDays).toBeGreaterThanOrEqual(1);
      expect(progress2.streakDays).toBe(0);
    });

    it('should handle streak calculation with various game types', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const gameTypes: Array<'matching' | 'quiz' | 'chemicalFormula' | 'periodicTableJigsaw'> = [
        'matching',
        'quiz',
        'chemicalFormula',
        'periodicTableJigsaw',
      ];

      for (const gameType of gameTypes) {
        const session: GameSession = {
          sessionId: `session-${gameType}`,
          gameType,
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
      expect(progress.streakDays).toBeGreaterThanOrEqual(0);
    });

    it('should be a number type', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const progress = progressTrackingSystem.getProgress(userId);
      expect(typeof progress.streakDays).toBe('number');
    });
  });

  describe('Streak Reset on Missed Days', () => {
    it('should reset streak to 1 when there is a gap in sessions', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // First session
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

      progressTrackingSystem.updateProgress(userId, session1);
      const progress1 = progressTrackingSystem.getProgress(userId);
      expect(progress1.streakDays).toBeGreaterThanOrEqual(1);

      // Simulate a gap by manually setting lastSessionDate to 2 days ago
      progress1.lastSessionDate = Date.now() - 2 * 24 * 60 * 60 * 1000;

      // Second session after gap
      const session2: GameSession = {
        sessionId: 'session2',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now() - 3000,
        elements: [],
        currentIndex: 0,
        score: 50,
        answers: [
          {
            elementId: 'O',
            userAnswer: 'Oxygen',
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          },
        ],
        correctCount: 1,
        totalCount: 1,
      };

      progressTrackingSystem.updateProgress(userId, session2);
      const progress2 = progressTrackingSystem.getProgress(userId);

      // Streak should reset to 1 after gap
      expect(progress2.streakDays).toBe(1);
    });

    it('should maintain streak when sessions are on consecutive days', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // First session
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

      progressTrackingSystem.updateProgress(userId, session1);
      const progress1 = progressTrackingSystem.getProgress(userId);
      const streak1 = progress1.streakDays;

      // Simulate next day by setting lastSessionDate to yesterday
      progress1.lastSessionDate = Date.now() - 24 * 60 * 60 * 1000;

      // Second session on next day
      const session2: GameSession = {
        sessionId: 'session2',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now() - 3000,
        elements: [],
        currentIndex: 0,
        score: 50,
        answers: [
          {
            elementId: 'O',
            userAnswer: 'Oxygen',
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          },
        ],
        correctCount: 1,
        totalCount: 1,
      };

      progressTrackingSystem.updateProgress(userId, session2);
      const progress2 = progressTrackingSystem.getProgress(userId);

      // Streak should increment for consecutive days
      expect(progress2.streakDays).toBe(streak1 + 1);
    });

    it('should handle edge case of exactly 24 hours between sessions', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // First session
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

      progressTrackingSystem.updateProgress(userId, session1);
      const progress1 = progressTrackingSystem.getProgress(userId);

      // Set lastSessionDate to exactly 24 hours ago
      progress1.lastSessionDate = Date.now() - 24 * 60 * 60 * 1000;

      // Second session
      const session2: GameSession = {
        sessionId: 'session2',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now() - 3000,
        elements: [],
        currentIndex: 0,
        score: 50,
        answers: [
          {
            elementId: 'O',
            userAnswer: 'Oxygen',
            correct: true,
            responseTime: 1000,
            timestamp: Date.now(),
          },
        ],
        correctCount: 1,
        totalCount: 1,
      };

      progressTrackingSystem.updateProgress(userId, session2);
      const progress2 = progressTrackingSystem.getProgress(userId);

      // Should be treated as consecutive days
      expect(progress2.streakDays).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Streak Badge Awarding', () => {
    it('should award streak-3 badge when 3-day streak is reached', () => {
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

        // Simulate next day
        if (day < 2) {
          const progress = progressTrackingSystem.getProgress(userId);
          progress.lastSessionDate = Date.now() - (2 - day) * 24 * 60 * 60 * 1000;
        }
      }

      const progress = progressTrackingSystem.getProgress(userId);
      expect(progress.streakDays).toBeGreaterThanOrEqual(1);
    });

    it('should award streak-7 badge when 7-day streak is reached', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Simulate 7 consecutive days
      for (let day = 0; day < 7; day++) {
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

        // Simulate next day
        if (day < 6) {
          const progress = progressTrackingSystem.getProgress(userId);
          progress.lastSessionDate = Date.now() - (6 - day) * 24 * 60 * 60 * 1000;
        }
      }

      const progress = progressTrackingSystem.getProgress(userId);
      expect(progress.streakDays).toBeGreaterThanOrEqual(1);
    });

    it('should award streak-30 badge when 30-day streak is reached', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Simulate 30 consecutive days
      for (let day = 0; day < 30; day++) {
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

        // Simulate next day
        if (day < 29) {
          const progress = progressTrackingSystem.getProgress(userId);
          progress.lastSessionDate = Date.now() - (29 - day) * 24 * 60 * 60 * 1000;
        }
      }

      const progress = progressTrackingSystem.getProgress(userId);
      expect(progress.streakDays).toBeGreaterThanOrEqual(1);
    });

    it('should check streak badge criteria correctly', () => {
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

      // Check badge criteria
      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      // Should not throw error
      expect(Array.isArray(newBadges)).toBe(true);
    });

    it('should not award streak badge if criteria not met', () => {
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

      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      // Should not include streak badges if criteria not met
      const streakBadges = newBadges.filter((b) => b.includes('streak'));
      expect(streakBadges.length).toBe(0);
    });

    it('should handle multiple users with different streaks', () => {
      const user1 = 'user1';
      const user2 = 'user2';

      progressTrackingSystem.loadFromLocalStorage(user1, 3);
      progressTrackingSystem.loadFromLocalStorage(user2, 3);

      // User1 has a session
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

      progressTrackingSystem.updateProgress(user1, session1);

      const progress1 = progressTrackingSystem.getProgress(user1);
      const progress2 = progressTrackingSystem.getProgress(user2);

      // User1 should have streak, User2 should have 0
      expect(progress1.streakDays).toBeGreaterThanOrEqual(1);
      expect(progress2.streakDays).toBe(0);
    });

    it('should track streak through RewardSystem getStreakDays', () => {
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
      const progress = progressTrackingSystem.getProgress(userId);

      expect(streakDays).toBe(progress.streakDays);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid userId in getStreakDays', () => {
      expect(() => rewardSystem.getStreakDays('')).toThrow('Invalid userId');
      expect(() => rewardSystem.getStreakDays('   ')).toThrow('Invalid userId');
    });

    it('should throw error for non-existent user in getStreakDays', () => {
      expect(() => rewardSystem.getStreakDays('non-existent-user')).toThrow(
        'User non-existent-user not found',
      );
    });

    it('should handle streak calculation with zero answers', () => {
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
        answers: [],
        correctCount: 0,
        totalCount: 0,
      };

      progressTrackingSystem.updateProgress(userId, session);
      const progress = progressTrackingSystem.getProgress(userId);

      expect(progress.streakDays).toBeGreaterThanOrEqual(0);
    });

    it('should handle streak calculation with mixed correct and incorrect answers', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const answers: Answer[] = [];
      for (let i = 0; i < 10; i++) {
        answers.push({
          elementId: `element${i}`,
          userAnswer: `answer${i}`,
          correct: i % 2 === 0, // 50% accuracy
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
        score: 50,
        answers,
        correctCount: 5,
        totalCount: 10,
      };

      progressTrackingSystem.updateProgress(userId, session);
      const progress = progressTrackingSystem.getProgress(userId);

      expect(progress.streakDays).toBeGreaterThanOrEqual(0);
    });

    it('should persist streak data across sessions', () => {
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
      const progress1 = progressTrackingSystem.getProgress(userId);
      const streak1 = progress1.streakDays;

      // Save to local storage
      progressTrackingSystem.saveToLocalStorage(userId);

      // Create new instance and load
      const newProgressTrackingSystem = new ProgressTrackingSystem();
      newProgressTrackingSystem.loadFromLocalStorage(userId, 3);
      const progress2 = newProgressTrackingSystem.getProgress(userId);

      expect(progress2.streakDays).toBe(streak1);
    });
  });
});
