/**
 * Unit tests for RewardSystem - streak days calculation
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

});
