/**
 * Unit tests for GameEngine (split from GameEngine.test.ts, issue #37).
 * Test code moved unedited.
 */


import { GameEngine } from '../../src/core/GameEngine';
import { ElementContentManager } from '../../src/managers/ElementContentManager';

describe('GameEngine - Difficulty Adjustment Integration', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe('startSession with userId', () => {
    it('should load user difficulty when userId is provided', () => {
      const userId = 'test-user-1';
      const session = engine.startSession('matching', 3, userId);
      expect(session.difficulty).toBe('easy'); // Default difficulty for new user
    });

    it('should use default-user when userId is not provided', () => {
      const session = engine.startSession('matching', 3);
      expect(session.difficulty).toBe('easy'); // Default difficulty
    });

    it('should create session with difficulty from DifficultyAdjustmentSystem', () => {
      const userId = 'test-user-2';
      const session1 = engine.startSession('matching', 3, userId);
      expect(session1.difficulty).toBe('easy');

      // Complete session with high accuracy to trigger difficulty increase
      for (const element of session1.elements) {
        engine.submitAnswer(session1.sessionId, element.name);
      }
      engine.adjustDifficultyAfterSession(session1.sessionId);

      // Start new session for same user - should have increased difficulty
      const session2 = engine.startSession('matching', 3, userId);
      expect(session2.difficulty).toBe('medium');
    });

    it('should maintain separate difficulty levels for different users', () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      const session1 = engine.startSession('matching', 3, userId1);
      expect(session1.difficulty).toBe('easy');

      // Complete session1 with high accuracy
      for (const element of session1.elements) {
        engine.submitAnswer(session1.sessionId, element.name);
      }
      engine.adjustDifficultyAfterSession(session1.sessionId);

      // Start session for user2 - should still be easy
      const session2 = engine.startSession('matching', 3, userId2);
      expect(session2.difficulty).toBe('easy');

      // Start new session for user1 - should be medium
      const session3 = engine.startSession('matching', 3, userId1);
      expect(session3.difficulty).toBe('medium');
    });
  });

  describe('adjustDifficultyAfterSession', () => {
    it('should increase difficulty when accuracy >= 80%', () => {
      const userId = 'test-user-3';
      const session = engine.startSession('matching', 3, userId);

      // Answer all questions correctly (100% accuracy)
      for (const element of session.elements) {
        engine.submitAnswer(session.sessionId, element.name);
      }

      const newDifficulty = engine.adjustDifficultyAfterSession(session.sessionId);
      expect(newDifficulty).toBe('medium');
    });

    it('should decrease difficulty when accuracy < 50%', () => {
      const userId = 'test-user-4';
      const session = engine.startSession('matching', 3, userId);

      // First, increase difficulty to medium
      for (const element of session.elements) {
        engine.submitAnswer(session.sessionId, element.name);
      }
      engine.adjustDifficultyAfterSession(session.sessionId);

      // Start new session at medium difficulty
      const session2 = engine.startSession('matching', 3, userId);
      expect(session2.difficulty).toBe('medium');

      // Answer all questions incorrectly (0% accuracy)
      for (let i = 0; i < session2.elements.length; i++) {
        engine.submitAnswer(session2.sessionId, 'wrong answer');
      }

      const newDifficulty = engine.adjustDifficultyAfterSession(session2.sessionId);
      expect(newDifficulty).toBe('easy');
    });

    it('should maintain difficulty when accuracy is between 50% and 80%', () => {
      const userId = 'test-user-5';
      const session = engine.startSession('matching', 3, userId);

      // Answer about 60% correctly (9 out of 15)
      for (let i = 0; i < 9; i++) {
        engine.submitAnswer(session.sessionId, session.elements[i].name);
      }
      for (let i = 9; i < session.elements.length; i++) {
        engine.submitAnswer(session.sessionId, 'wrong answer');
      }

      const newDifficulty = engine.adjustDifficultyAfterSession(session.sessionId);
      expect(newDifficulty).toBe('easy'); // Should maintain easy
    });

    it('should persist difficulty changes to local storage', () => {
      const userId = 'test-user-6';
      const session = engine.startSession('matching', 3, userId);

      // Answer all correctly
      for (const element of session.elements) {
        engine.submitAnswer(session.sessionId, element.name);
      }

      const newDifficulty = engine.adjustDifficultyAfterSession(session.sessionId);
      expect(newDifficulty).toBe('medium');

      // Verify that the same engine instance maintains the difficulty
      const session2 = engine.startSession('matching', 3, userId);
      expect(session2.difficulty).toBe('medium');
    });

    it('should throw error for non-existent session', () => {
      expect(() => engine.adjustDifficultyAfterSession('invalid_session')).toThrow(
        'Session invalid_session not found',
      );
    });

    it('should return the new difficulty level', () => {
      const userId = 'test-user-7';
      const session = engine.startSession('matching', 3, userId);

      // Answer all correctly
      for (const element of session.elements) {
        engine.submitAnswer(session.sessionId, element.name);
      }

      const newDifficulty = engine.adjustDifficultyAfterSession(session.sessionId);
      expect(['easy', 'medium', 'hard']).toContain(newDifficulty);
      expect(newDifficulty).toBe('medium');
    });
  });

  describe('startMatchingSession with userId', () => {
    it('should pass userId to startSession', () => {
      const userId = 'test-user-8';
      const session = engine.startMatchingSession(3, userId);
      expect(session.difficulty).toBe('easy');
    });
  });

  describe('startQuizSession with userId', () => {
    it('should pass userId to startSession', () => {
      const userId = 'test-user-9';
      const session = engine.startQuizSession(5, userId);
      expect(session.difficulty).toBe('easy');
    });
  });

  describe('Difficulty progression across multiple sessions', () => {
    it('should progress from easy to medium to hard with consistent high accuracy', () => {
      const userId = 'test-user-10';

      // Session 1: easy -> medium
      const session1 = engine.startSession('matching', 3, userId);
      expect(session1.difficulty).toBe('easy');
      for (const element of session1.elements) {
        engine.submitAnswer(session1.sessionId, element.name);
      }
      engine.adjustDifficultyAfterSession(session1.sessionId);

      // Session 2: medium -> hard
      const session2 = engine.startSession('matching', 3, userId);
      expect(session2.difficulty).toBe('medium');
      for (const element of session2.elements) {
        engine.submitAnswer(session2.sessionId, element.name);
      }
      engine.adjustDifficultyAfterSession(session2.sessionId);

      // Session 3: hard (stays hard)
      const session3 = engine.startSession('matching', 3, userId);
      expect(session3.difficulty).toBe('hard');
      for (const element of session3.elements) {
        engine.submitAnswer(session3.sessionId, element.name);
      }
      engine.adjustDifficultyAfterSession(session3.sessionId);

      // Session 4: should still be hard
      const session4 = engine.startSession('matching', 3, userId);
      expect(session4.difficulty).toBe('hard');
    });

    it('should regress from hard to medium to easy with consistent low accuracy', () => {
      const userId = 'test-user-11';

      // First, progress to hard
      const session1 = engine.startSession('matching', 3, userId);
      for (const element of session1.elements) {
        engine.submitAnswer(session1.sessionId, element.name);
      }
      engine.adjustDifficultyAfterSession(session1.sessionId);

      const session2 = engine.startSession('matching', 3, userId);
      for (const element of session2.elements) {
        engine.submitAnswer(session2.sessionId, element.name);
      }
      engine.adjustDifficultyAfterSession(session2.sessionId);

      // Now regress: hard -> medium
      const session3 = engine.startSession('matching', 3, userId);
      expect(session3.difficulty).toBe('hard');
      for (let i = 0; i < session3.elements.length; i++) {
        engine.submitAnswer(session3.sessionId, 'wrong');
      }
      engine.adjustDifficultyAfterSession(session3.sessionId);

      // Verify regressed to medium
      const session4 = engine.startSession('matching', 3, userId);
      expect(session4.difficulty).toBe('medium');
    });
  });
});
