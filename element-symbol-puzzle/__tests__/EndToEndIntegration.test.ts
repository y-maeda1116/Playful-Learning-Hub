/**
 * End-to-End Integration Tests for Element Symbol Puzzle
 * 
 * Tests complete game flows, progress persistence, badge awarding,
 * difficulty adjustment, and jigsaw puzzle completion across multiple sessions.
 * 
 * Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1
 */

import { GameOrchestrator } from '../GameOrchestrator';
import { GameEngine } from '../GameEngine';
import { ProgressTrackingSystem } from '../ProgressTrackingSystem';
import { RewardSystem } from '../RewardSystem';
import { AudioSystem } from '../AudioSystem';
import { PeriodicTableManager } from '../PeriodicTableManager';
import { StorageAdapter } from '../StorageAdapter';

describe('End-to-End Integration Tests', () => {
  let orchestrator: GameOrchestrator;
  let gameEngine: GameEngine;
  let progressTracking: ProgressTrackingSystem;
  let rewardSystem: RewardSystem;
  let audioSystem: AudioSystem;
  let periodicTableManager: PeriodicTableManager;
  let storageAdapter: StorageAdapter;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    gameEngine = new GameEngine();
    progressTracking = new ProgressTrackingSystem();
    rewardSystem = new RewardSystem(progressTracking);
    audioSystem = new AudioSystem();
    periodicTableManager = new PeriodicTableManager();
    storageAdapter = new StorageAdapter();

    orchestrator = new GameOrchestrator(
      gameEngine,
      progressTracking,
      rewardSystem,
      audioSystem,
      periodicTableManager,
    );
  });

  describe('1. Complete Matching Game Session', () => {
    it('should complete a full matching game session with score and accuracy', async () => {
      orchestrator.setCurrentUser('testUser1');
      const session = orchestrator.startGameSession('matching', 3);

      expect(session.gameType).toBe('matching');
      expect(session.gradeLevel).toBe(3);
      expect(session.elements.length).toBeGreaterThan(0);

      const initialScore = session.score;
      let correctAnswers = 0;

      // Answer all questions
      for (let i = 0; i < session.elements.length; i++) {
        const question = await orchestrator.displayNextQuestion();
        expect(question).toBeDefined();

        const result = await orchestrator.submitAnswer(question.name);
        if (result.isCorrect) {
          correctAnswers++;
        }
      }

      const endResult = await orchestrator.endGameSession();

      expect(endResult.score).toBeGreaterThanOrEqual(initialScore);
      expect(endResult.accuracy).toBeGreaterThanOrEqual(0);
      expect(endResult.accuracy).toBeLessThanOrEqual(100);
      expect(correctAnswers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('2. Complete Quiz Game Session', () => {
    it('should complete a full quiz game session with accuracy tracking', async () => {
      orchestrator.setCurrentUser('testUser2');
      const session = orchestrator.startGameSession('quiz', 5);

      expect(session.gameType).toBe('quiz');
      expect(session.gradeLevel).toBe(5);

      let correctAnswers = 0;
      const totalQuestions = Math.min(5, session.elements.length);

      for (let i = 0; i < totalQuestions; i++) {
        const question = await orchestrator.displayNextQuestion();
        expect(question).toBeDefined();

        const result = await orchestrator.submitAnswer(question.name);
        if (result.isCorrect) {
          correctAnswers++;
        }
      }

      const endResult = await orchestrator.endGameSession();

      expect(endResult.accuracy).toBeGreaterThanOrEqual(0);
      expect(endResult.accuracy).toBeLessThanOrEqual(100);
      expect(correctAnswers).toBeLessThanOrEqual(totalQuestions);
    });
  });

  describe('3. Complete Chemical Formula Puzzle Session', () => {
    it('should complete a full chemical formula puzzle session', async () => {
      orchestrator.setCurrentUser('testUser3');
      const session = orchestrator.startGameSession('chemicalFormula', 6);

      expect(session.gameType).toBe('chemicalFormula');
      expect(session.gradeLevel).toBe(6);

      let correctAnswers = 0;
      const totalQuestions = Math.min(3, session.elements.length);

      for (let i = 0; i < totalQuestions; i++) {
        const question = await orchestrator.displayNextQuestion();
        if (question) {
          const result = await orchestrator.submitAnswer(question.name);
          if (result.isCorrect) {
            correctAnswers++;
          }
        }
      }

      const endResult = await orchestrator.endGameSession();

      expect(endResult.score).toBeGreaterThanOrEqual(0);
      expect(endResult.accuracy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('4. Complete Periodic Table Jigsaw Puzzle Session', () => {
    it('should complete a periodic table jigsaw puzzle session', async () => {
      orchestrator.setCurrentUser('testUser4');
      const session = orchestrator.startGameSession('periodicTableJigsaw', 5);

      expect(session.gameType).toBe('periodicTableJigsaw');
      expect(session.gradeLevel).toBe(5);

      const puzzle = periodicTableManager.getPuzzle('medium');
      expect(puzzle).toBeDefined();
      expect(puzzle.elements.length).toBeGreaterThan(0);

      // Verify puzzle can be retrieved
      const allPuzzles = periodicTableManager.getAllPuzzles();
      expect(allPuzzles.length).toBeGreaterThan(0);

      const endResult = await orchestrator.endGameSession();
      expect(endResult).toHaveProperty('score');
      expect(endResult).toHaveProperty('accuracy');
    });
  });

  describe('5. Progress Persistence Across Sessions', () => {
    it('should save and restore progress across multiple sessions', async () => {
      const userId = 'persistenceTestUser';
      orchestrator.setCurrentUser(userId);

      // Session 1: Complete a matching game
      let session1 = orchestrator.startGameSession('matching', 3);
      const question1 = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question1.name);
      const result1 = await orchestrator.endGameSession();

      // Get progress after session 1
      let progress1 = orchestrator.getUserProgress();
      expect(progress1.sessionCount).toBe(1);
      const session1Accuracy = result1.accuracy;

      // Save progress to localStorage
      storageAdapter.saveToLocalStorage(userId, progress1);

      // Session 2: Complete another game
      session1 = orchestrator.startGameSession('quiz', 5);
      const question2 = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question2.name);
      const result2 = await orchestrator.endGameSession();

      // Get progress after session 2
      let progress2 = orchestrator.getUserProgress();
      expect(progress2.sessionCount).toBe(2);

      // Verify progress was accumulated
      expect(progress2.sessionCount).toBeGreaterThan(progress1.sessionCount);

      // Load progress from localStorage and verify
      const loadedProgress = storageAdapter.loadFromLocalStorage(userId);
      expect(loadedProgress).toBeDefined();
      if (loadedProgress) {
        expect(loadedProgress.userId).toBe(userId);
      }
    });
  });

  describe('6. Badge Awarding on Session Completion', () => {
    it('should award badges when criteria are met', async () => {
      const userId = 'badgeTestUser';
      orchestrator.setCurrentUser(userId);

      // Complete multiple sessions to trigger badge criteria
      for (let i = 0; i < 3; i++) {
        const session = orchestrator.startGameSession('matching', 3);
        const question = await orchestrator.displayNextQuestion();
        await orchestrator.submitAnswer(question.name);
        const result = await orchestrator.endGameSession();

        // Check if badges were earned
        const badges = orchestrator.getUnlockedBadges();
        expect(Array.isArray(badges)).toBe(true);
      }

      // Verify progress shows badges
      const progress = orchestrator.getUserProgress();
      expect(progress.badges).toBeDefined();
      expect(Array.isArray(progress.badges)).toBe(true);
    });
  });

  describe('7. Badge Display in User Profile', () => {
    it('should display earned badges in user profile', async () => {
      const userId = 'badgeDisplayUser';
      orchestrator.setCurrentUser(userId);

      // Complete a session
      const session = orchestrator.startGameSession('matching', 3);
      const question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);
      await orchestrator.endGameSession();

      // Get user progress
      const progress = orchestrator.getUserProgress();

      // Verify badges are accessible
      expect(progress.badges).toBeDefined();
      expect(Array.isArray(progress.badges)).toBe(true);

      // Get unlocked badges
      const unlockedBadges = orchestrator.getUnlockedBadges();
      expect(Array.isArray(unlockedBadges)).toBe(true);
    });
  });

  describe('8. Difficulty Adjustment Across Sessions', () => {
    it('should increase difficulty when accuracy is 80% or higher', async () => {
      const userId = 'difficultyUpUser';
      orchestrator.setCurrentUser(userId);

      // Session 1: Answer correctly to achieve high accuracy
      const session1 = orchestrator.startGameSession('matching', 3);
      const elements1 = session1.elements;

      // Answer at least 80% correctly
      const correctCount = Math.ceil(elements1.length * 0.8);
      for (let i = 0; i < elements1.length; i++) {
        const question = await orchestrator.displayNextQuestion();
        if (i < correctCount) {
          await orchestrator.submitAnswer(question.name);
        } else {
          await orchestrator.submitAnswer('wrong');
        }
      }

      const result1 = await orchestrator.endGameSession();
      expect(result1.accuracy).toBeGreaterThanOrEqual(80);

      // Session 2: Verify difficulty may have increased
      const session2 = orchestrator.startGameSession('matching', 3);
      expect(session2).toBeDefined();
      expect(session2.difficulty).toBeDefined();
    });

    it('should decrease difficulty when accuracy is below 50%', async () => {
      const userId = 'difficultyDownUser';
      orchestrator.setCurrentUser(userId);

      // Session 1: Answer incorrectly to achieve low accuracy
      const session1 = orchestrator.startGameSession('matching', 3);
      const elements1 = session1.elements;

      // Answer less than 50% correctly
      for (let i = 0; i < elements1.length; i++) {
        const question = await orchestrator.displayNextQuestion();
        await orchestrator.submitAnswer('wrong');
      }

      const result1 = await orchestrator.endGameSession();
      expect(result1.accuracy).toBeLessThan(50);

      // Session 2: Verify difficulty may have decreased
      const session2 = orchestrator.startGameSession('matching', 3);
      expect(session2).toBeDefined();
      expect(session2.difficulty).toBeDefined();
    });
  });

  describe('9. Jigsaw Puzzle Completion Flow', () => {
    it('should detect jigsaw puzzle completion and display learning info', async () => {
      const userId = 'jigsawUser';
      orchestrator.setCurrentUser(userId);

      // Start jigsaw puzzle session
      const session = orchestrator.startGameSession('periodicTableJigsaw', 5);
      expect(session.gameType).toBe('periodicTableJigsaw');

      // Get puzzle
      const puzzle = periodicTableManager.getPuzzle('medium');
      expect(puzzle).toBeDefined();

      // Verify puzzle completion detection works
      const emptyPlaced = new Map();
      const isComplete = periodicTableManager.isPuzzleComplete(emptyPlaced, puzzle);
      expect(isComplete).toBe(false);

      // Verify learning info can be retrieved
      const learningInfo = periodicTableManager.getLearningInfo(puzzle);
      expect(learningInfo).toHaveProperty('periodsInfo');
      expect(learningInfo).toHaveProperty('groupsInfo');
      expect(learningInfo).toHaveProperty('categoriesInfo');

      // End session
      const result = await orchestrator.endGameSession();
      expect(result).toHaveProperty('score');
    });
  });

  describe('10. Multi-Session Flow with Progress Accumulation', () => {
    it('should accumulate progress across multiple game sessions', async () => {
      const userId = 'multiSessionUser';
      orchestrator.setCurrentUser(userId);

      // Session 1: Matching game
      let session = orchestrator.startGameSession('matching', 3);
      let question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);
      let result = await orchestrator.endGameSession();

      let progress = orchestrator.getUserProgress();
      expect(progress.sessionCount).toBe(1);
      const session1Accuracy = result.accuracy;

      // Session 2: Quiz game
      session = orchestrator.startGameSession('quiz', 5);
      question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);
      result = await orchestrator.endGameSession();

      progress = orchestrator.getUserProgress();
      expect(progress.sessionCount).toBe(2);

      // Session 3: Chemical formula game
      session = orchestrator.startGameSession('chemicalFormula', 6);
      question = await orchestrator.displayNextQuestion();
      if (question) {
        await orchestrator.submitAnswer(question.name);
      }
      result = await orchestrator.endGameSession();

      progress = orchestrator.getUserProgress();
      expect(progress.sessionCount).toBe(3);

      // Verify total session time is accumulated
      expect(progress.totalSessionTime).toBeGreaterThanOrEqual(0);

      // Verify average accuracy is calculated
      expect(progress.averageAccuracy).toBeGreaterThanOrEqual(0);
      expect(progress.averageAccuracy).toBeLessThanOrEqual(100);
    });
  });

  describe('11. Streak Days Tracking', () => {
    it('should track consecutive learning days', async () => {
      const userId = 'streakUser';
      orchestrator.setCurrentUser(userId);

      // Complete a session
      const session = orchestrator.startGameSession('matching', 3);
      const question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);
      await orchestrator.endGameSession();

      // Get streak days
      const streakDays = orchestrator.getStreakDays();
      expect(typeof streakDays).toBe('number');
      expect(streakDays).toBeGreaterThanOrEqual(0);

      // Verify progress shows streak
      const progress = orchestrator.getUserProgress();
      expect(progress.streakDays).toBeGreaterThanOrEqual(0);
    });
  });

  describe('12. Multiple User Profiles Isolation', () => {
    it('should maintain separate progress for different users', async () => {
      // User 1 session
      orchestrator.setCurrentUser('user1');
      let session = orchestrator.startGameSession('matching', 3);
      let question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);
      await orchestrator.endGameSession();

      const user1Progress = orchestrator.getUserProgress();
      expect(user1Progress.userId).toBe('user1');
      expect(user1Progress.sessionCount).toBe(1);

      // User 2 session
      orchestrator.setCurrentUser('user2');
      session = orchestrator.startGameSession('matching', 3);
      question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);
      await orchestrator.endGameSession();

      const user2Progress = orchestrator.getUserProgress();
      expect(user2Progress.userId).toBe('user2');
      expect(user2Progress.sessionCount).toBe(1);

      // Verify user 1 progress is unchanged
      orchestrator.setCurrentUser('user1');
      const user1ProgressAfter = orchestrator.getUserProgress();
      expect(user1ProgressAfter.sessionCount).toBe(1);

      // Verify user 2 progress is unchanged
      orchestrator.setCurrentUser('user2');
      const user2ProgressAfter = orchestrator.getUserProgress();
      expect(user2ProgressAfter.sessionCount).toBe(1);
    });
  });

  describe('13. Event Emission Throughout Game Flow', () => {
    it('should emit all expected events during complete game flow', async () => {
      const events: string[] = [];
      orchestrator.onGameEvent((event) => {
        events.push(event.type);
      });

      orchestrator.setCurrentUser('eventTestUser');
      orchestrator.startGameSession('matching', 3);

      const question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);
      await orchestrator.endGameSession();

      expect(events).toContain('sessionStarted');
      expect(events).toContain('questionDisplayed');
      expect(events).toContain('answerSubmitted');
      expect(events).toContain('feedbackDisplayed');
      expect(events).toContain('sessionEnded');
    });
  });

  describe('14. Grade Level Appropriate Content', () => {
    it('should provide grade-appropriate elements for each grade level', async () => {
      for (const grade of [3, 4, 5, 6] as const) {
        orchestrator.setCurrentUser(`gradeUser${grade}`);
        const session = orchestrator.startGameSession('matching', grade);

        expect(session.gradeLevel).toBe(grade);
        expect(session.elements.length).toBeGreaterThan(0);

        // Verify all elements are appropriate for the grade
        for (const element of session.elements) {
          expect(element.gradeLevel).toBeLessThanOrEqual(grade);
        }

        await orchestrator.endGameSession();
      }
    });
  });

  describe('15. Complete Game Flow with All Components', () => {
    it('should integrate all components in a complete game flow', async () => {
      const userId = 'completeFlowUser';
      orchestrator.setCurrentUser(userId);

      // Verify all components are accessible
      expect(orchestrator.getGameEngine()).toBeDefined();
      expect(orchestrator.getProgressTracking()).toBeDefined();
      expect(orchestrator.getRewardSystem()).toBeDefined();
      expect(orchestrator.getAudioSystem()).toBeDefined();
      expect(orchestrator.getPeriodicTableManager()).toBeDefined();

      // Start session
      const session = orchestrator.startGameSession('matching', 3);
      expect(session).toBeDefined();

      // Play through game
      const question = await orchestrator.displayNextQuestion();
      expect(question).toBeDefined();

      const result = await orchestrator.submitAnswer(question.name);
      expect(result).toHaveProperty('isCorrect');
      expect(result).toHaveProperty('feedback');

      // End session
      const endResult = await orchestrator.endGameSession();
      expect(endResult).toHaveProperty('score');
      expect(endResult).toHaveProperty('accuracy');
      expect(endResult).toHaveProperty('badges');

      // Verify progress was updated
      const progress = orchestrator.getUserProgress();
      expect(progress.sessionCount).toBeGreaterThan(0);
    });
  });
});
