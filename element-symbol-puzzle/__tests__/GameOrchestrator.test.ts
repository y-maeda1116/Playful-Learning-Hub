/**
 * Unit tests for GameOrchestrator
 * 
 * Tests game flow orchestration, event handling, and component integration
 */

import { GameOrchestrator } from '../GameOrchestrator';
import { GameEngine } from '../GameEngine';
import { ProgressTrackingSystem } from '../ProgressTrackingSystem';
import { RewardSystem } from '../RewardSystem';
import { AudioSystem } from '../AudioSystem';
import { PeriodicTableManager } from '../PeriodicTableManager';

describe('GameOrchestrator', () => {
  let orchestrator: GameOrchestrator;
  let gameEngine: GameEngine;
  let progressTracking: ProgressTrackingSystem;
  let rewardSystem: RewardSystem;
  let audioSystem: AudioSystem;
  let periodicTableManager: PeriodicTableManager;

  beforeEach(() => {
    gameEngine = new GameEngine();
    progressTracking = new ProgressTrackingSystem();
    rewardSystem = new RewardSystem(progressTracking);
    audioSystem = new AudioSystem();
    periodicTableManager = new PeriodicTableManager();

    orchestrator = new GameOrchestrator(
      gameEngine,
      progressTracking,
      rewardSystem,
      audioSystem,
      periodicTableManager,
    );
  });

  describe('startGameSession', () => {
    it('should start a matching game session', () => {
      const session = orchestrator.startGameSession('matching', 3);
      expect(session).toBeDefined();
      expect(session.gameType).toBe('matching');
      expect(session.gradeLevel).toBe(3);
      expect(session.elements.length).toBeGreaterThan(0);
    });

    it('should start a quiz game session', () => {
      const session = orchestrator.startGameSession('quiz', 5);
      expect(session).toBeDefined();
      expect(session.gameType).toBe('quiz');
      expect(session.gradeLevel).toBe(5);
    });

    it('should start a chemical formula game session', () => {
      const session = orchestrator.startGameSession('chemicalFormula', 5);
      expect(session).toBeDefined();
      expect(session.gameType).toBe('chemicalFormula');
      expect(session.gradeLevel).toBe(5);
    });

    it('should start a periodic table jigsaw game session', () => {
      const session = orchestrator.startGameSession('periodicTableJigsaw', 5);
      expect(session).toBeDefined();
      expect(session.gameType).toBe('periodicTableJigsaw');
      expect(session.gradeLevel).toBe(5);
    });

    it('should set current user ID', () => {
      orchestrator.startGameSession('matching', 3, 'user123');
      expect(orchestrator.getCurrentUser()).toBe('user123');
    });

    it('should emit sessionStarted event', () => {
      const eventCallback = jest.fn();
      orchestrator.onGameEvent(eventCallback);

      orchestrator.startGameSession('matching', 3);

      expect(eventCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sessionStarted',
        }),
      );
    });
  });

  describe('displayNextQuestion', () => {
    it('should display next question', async () => {
      orchestrator.startGameSession('matching', 3);
      const question = await orchestrator.displayNextQuestion();

      expect(question).toBeDefined();
      expect(question.symbol).toBeDefined();
      expect(question.name).toBeDefined();
    });

    it('should emit questionDisplayed event', async () => {
      const eventCallback = jest.fn();
      orchestrator.onGameEvent(eventCallback);

      orchestrator.startGameSession('matching', 3);
      await orchestrator.displayNextQuestion();

      expect(eventCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'questionDisplayed',
        }),
      );
    });

    it('should throw error if no active session', async () => {
      await expect(orchestrator.displayNextQuestion()).rejects.toThrow();
    });

    it('should return null when game is complete', async () => {
      orchestrator.startGameSession('matching', 3);
      const session = orchestrator.getCurrentSession()!;

      // Submit answers for all elements
      for (let i = 0; i < session.elements.length; i++) {
        await orchestrator.displayNextQuestion();
        await orchestrator.submitAnswer(session.elements[i].name);
      }

      const nextQuestion = await orchestrator.displayNextQuestion();
      expect(nextQuestion).toBeNull();
    });
  });

  describe('submitAnswer', () => {
    it('should submit correct answer', async () => {
      orchestrator.startGameSession('matching', 3);
      const question = await orchestrator.displayNextQuestion();

      const result = await orchestrator.submitAnswer(question.name);

      expect(result.isCorrect).toBe(true);
      expect(result.feedback).toContain('正解');
    });

    it('should submit incorrect answer', async () => {
      orchestrator.startGameSession('matching', 3);
      const question = await orchestrator.displayNextQuestion();

      const result = await orchestrator.submitAnswer('wrong answer');

      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('不正解');
    });

    it('should emit answerSubmitted event', async () => {
      const eventCallback = jest.fn();
      orchestrator.onGameEvent(eventCallback);

      orchestrator.startGameSession('matching', 3);
      const question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);

      expect(eventCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'answerSubmitted',
        }),
      );
    });

    it('should emit feedbackDisplayed event', async () => {
      const eventCallback = jest.fn();
      orchestrator.onGameEvent(eventCallback);

      orchestrator.startGameSession('matching', 3);
      const question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);

      expect(eventCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'feedbackDisplayed',
        }),
      );
    });

    it('should throw error if no active session', async () => {
      await expect(orchestrator.submitAnswer('answer')).rejects.toThrow();
    });
  });

  describe('endGameSession', () => {
    it('should end game session', async () => {
      orchestrator.startGameSession('matching', 3);
      const question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);

      const result = await orchestrator.endGameSession();

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('accuracy');
      expect(result).toHaveProperty('badges');
    });

    it('should emit sessionEnded event', async () => {
      const eventCallback = jest.fn();
      orchestrator.onGameEvent(eventCallback);

      orchestrator.startGameSession('matching', 3);
      const question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);
      await orchestrator.endGameSession();

      expect(eventCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sessionEnded',
        }),
      );
    });

    it('should update progress', async () => {
      orchestrator.startGameSession('matching', 3, 'user123');
      const question = await orchestrator.displayNextQuestion();
      await orchestrator.submitAnswer(question.name);
      await orchestrator.endGameSession();

      const progress = orchestrator.getUserProgress();
      expect(progress.sessionCount).toBeGreaterThan(0);
    });

    it('should throw error if no active session', async () => {
      await expect(orchestrator.endGameSession()).rejects.toThrow();
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress', () => {
      orchestrator.setCurrentUser('user123');
      const progress = orchestrator.getUserProgress();

      expect(progress).toBeDefined();
      expect(progress.userId).toBe('user123');
      expect(progress).toHaveProperty('elementsLearned');
      expect(progress).toHaveProperty('badges');
      expect(progress).toHaveProperty('streakDays');
    });
  });

  describe('getUnlockedBadges', () => {
    it('should return unlocked badges', () => {
      orchestrator.setCurrentUser('user123');
      const badges = orchestrator.getUnlockedBadges();

      expect(Array.isArray(badges)).toBe(true);
    });
  });

  describe('getStreakDays', () => {
    it('should return streak days', () => {
      orchestrator.setCurrentUser('user123');
      const streakDays = orchestrator.getStreakDays();

      expect(typeof streakDays).toBe('number');
      expect(streakDays).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getCurrentSession', () => {
    it('should return current session', () => {
      orchestrator.startGameSession('matching', 3);
      const session = orchestrator.getCurrentSession();

      expect(session).toBeDefined();
      expect(session?.gameType).toBe('matching');
    });

    it('should return null when no session is active', () => {
      const session = orchestrator.getCurrentSession();
      expect(session).toBeNull();
    });
  });

  describe('setCurrentUser', () => {
    it('should set current user', () => {
      orchestrator.setCurrentUser('user456');
      expect(orchestrator.getCurrentUser()).toBe('user456');
    });
  });

  describe('getCurrentUser', () => {
    it('should return default user initially', () => {
      expect(orchestrator.getCurrentUser()).toBe('default-user');
    });

    it('should return set user', () => {
      orchestrator.setCurrentUser('user789');
      expect(orchestrator.getCurrentUser()).toBe('user789');
    });
  });

  describe('getPeriodicTableManager', () => {
    it('should return periodic table manager', () => {
      const manager = orchestrator.getPeriodicTableManager();
      expect(manager).toBeDefined();
      expect(manager).toBeInstanceOf(PeriodicTableManager);
    });
  });

  describe('getGameEngine', () => {
    it('should return game engine', () => {
      const engine = orchestrator.getGameEngine();
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(GameEngine);
    });
  });

  describe('getProgressTracking', () => {
    it('should return progress tracking system', () => {
      const tracking = orchestrator.getProgressTracking();
      expect(tracking).toBeDefined();
      expect(tracking).toBeInstanceOf(ProgressTrackingSystem);
    });
  });

  describe('getRewardSystem', () => {
    it('should return reward system', () => {
      const system = orchestrator.getRewardSystem();
      expect(system).toBeDefined();
      expect(system).toBeInstanceOf(RewardSystem);
    });
  });

  describe('getAudioSystem', () => {
    it('should return audio system', () => {
      const system = orchestrator.getAudioSystem();
      expect(system).toBeDefined();
      expect(system).toBeInstanceOf(AudioSystem);
    });
  });

  describe('Event handling', () => {
    it('should handle multiple event listeners', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      orchestrator.onGameEvent(callback1);
      orchestrator.onGameEvent(callback2);

      orchestrator.startGameSession('matching', 3);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should continue processing events even if listener throws', async () => {
      const callback1 = jest.fn(() => {
        throw new Error('Test error');
      });
      const callback2 = jest.fn();

      orchestrator.onGameEvent(callback1);
      orchestrator.onGameEvent(callback2);

      orchestrator.startGameSession('matching', 3);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Complete game flow', () => {
    it('should complete a full game session', async () => {
      const eventCallback = jest.fn();
      orchestrator.onGameEvent(eventCallback);

      // Start session
      orchestrator.startGameSession('matching', 3, 'testUser');
      expect(eventCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'sessionStarted' }),
      );

      // Display and answer questions
      const session = orchestrator.getCurrentSession()!;
      for (let i = 0; i < Math.min(3, session.elements.length); i++) {
        const question = await orchestrator.displayNextQuestion();
        expect(eventCallback).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'questionDisplayed' }),
        );

        await orchestrator.submitAnswer(question.name);
        expect(eventCallback).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'answerSubmitted' }),
        );
      }

      // End session
      const result = await orchestrator.endGameSession();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.accuracy).toBeGreaterThanOrEqual(0);
      expect(eventCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'sessionEnded' }),
      );
    });
  });
});
