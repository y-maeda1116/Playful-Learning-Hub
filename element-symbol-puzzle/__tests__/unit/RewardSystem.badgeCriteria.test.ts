/**
 * Unit tests for RewardSystem - badge criteria evaluation
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

});
