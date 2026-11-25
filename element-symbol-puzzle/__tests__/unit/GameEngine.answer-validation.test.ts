/**
 * Unit tests for GameEngine (split from GameEngine.test.ts, issue #37).
 * Test code moved unedited.
 */


import { GameEngine } from '../../src/core/GameEngine';
import { ElementContentManager } from '../../src/managers/ElementContentManager';

describe('GameEngine - Answer Validation', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe('submitAnswer - Matching Game', () => {
    it('should record correct answer as correct', () => {
      const session = engine.startSession('matching', 3);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, currentElement.name);
      expect(answer.correct).toBe(true);
    });

    it('should record incorrect answer as incorrect', () => {
      const session = engine.startSession('matching', 3);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, 'wrong answer');
      expect(answer.correct).toBe(false);
    });

    it('should handle case-insensitive matching', () => {
      const session = engine.startSession('matching', 3);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, currentElement.name.toUpperCase());
      expect(answer.correct).toBe(true);
    });

    it('should handle whitespace-trimmed matching', () => {
      const session = engine.startSession('matching', 3);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, `  ${currentElement.name}  `);
      expect(answer.correct).toBe(true);
    });

    it('should record element ID in answer', () => {
      const session = engine.startSession('matching', 3);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, currentElement.name);
      expect(answer.elementId).toBe(currentElement.id);
    });

    it('should record user answer text', () => {
      const session = engine.startSession('matching', 3);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const userAnswer = 'test answer';
      const answer = engine.submitAnswer(session.sessionId, userAnswer);
      expect(answer.userAnswer).toBe(userAnswer);
    });

    it('should record timestamp', () => {
      const session = engine.startSession('matching', 3);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const beforeTime = Date.now();
      const answer = engine.submitAnswer(session.sessionId, currentElement.name);
      const afterTime = Date.now();

      expect(answer.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(answer.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should record response time', () => {
      const session = engine.startSession('matching', 3);
      engine.startAnswerTimer(session.sessionId);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, currentElement.name);
      expect(answer.responseTime).toBeGreaterThanOrEqual(0);
      expect(typeof answer.responseTime).toBe('number');
    });

    it('should throw error for non-existent session', () => {
      expect(() => engine.submitAnswer('invalid_session', 'answer')).toThrow(
        'Session invalid_session not found',
      );
    });

    it('should throw error when game has ended', () => {
      const session = engine.startSession('matching', 3);
      // Submit answers for all elements
      for (let i = 0; i < session.elements.length; i++) {
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (currentElement) {
          engine.submitAnswer(session.sessionId, currentElement.name);
        }
      }

      // Try to submit another answer after game ends
      expect(() => engine.submitAnswer(session.sessionId, 'answer')).toThrow(
        'Game session has ended',
      );
    });
  });

  describe('submitAnswer - Quiz Game', () => {
    it('should record correct element type as correct', () => {
      const session = engine.startSession('quiz', 5);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, currentElement.type);
      expect(answer.correct).toBe(true);
    });

    it('should record correct reactivity as correct', () => {
      const session = engine.startSession('quiz', 5);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, currentElement.properties.reactivity);
      expect(answer.correct).toBe(true);
    });

    it('should record correct state as correct', () => {
      const session = engine.startSession('quiz', 5);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, currentElement.properties.state);
      expect(answer.correct).toBe(true);
    });

    it('should record incorrect answer as incorrect', () => {
      const session = engine.startSession('quiz', 5);
      const answer = engine.submitAnswer(session.sessionId, 'wrong answer');
      expect(answer.correct).toBe(false);
    });

    it('should handle case-insensitive quiz answers', () => {
      const session = engine.startSession('quiz', 5);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, currentElement.type.toUpperCase());
      expect(answer.correct).toBe(true);
    });

    it('should handle whitespace-trimmed quiz answers', () => {
      const session = engine.startSession('quiz', 5);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, `  ${currentElement.type}  `);
      expect(answer.correct).toBe(true);
    });
  });

  describe('submitQuizAnswer', () => {
    it('should submit quiz answer correctly', () => {
      const session = engine.startQuizSession(5);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      const answer = engine.submitQuizAnswer(session.sessionId, currentElement.type);
      expect(answer.correct).toBe(true);
    });

    it('should throw error for non-quiz session', () => {
      const session = engine.startSession('matching', 3);
      expect(() => engine.submitQuizAnswer(session.sessionId, 'answer')).toThrow(
        'This method is only for quiz sessions',
      );
    });

    it('should throw error for non-existent session', () => {
      expect(() => engine.submitQuizAnswer('invalid_session', 'answer')).toThrow(
        'Session invalid_session not found',
      );
    });
  });
});
