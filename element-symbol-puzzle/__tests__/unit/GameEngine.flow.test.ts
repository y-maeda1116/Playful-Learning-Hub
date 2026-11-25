/**
 * Unit tests for GameEngine (split from GameEngine.test.ts, issue #37).
 * Test code moved unedited.
 */


import { GameEngine } from '../../src/core/GameEngine';
import { ElementContentManager } from '../../src/managers/ElementContentManager';

describe('GameEngine - Game Flow Transitions', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe('getNextQuestion', () => {
    it('should return first element initially', () => {
      const session = engine.startSession('matching', 3);
      const question = engine.getNextQuestion(session.sessionId);
      expect(question).toBeDefined();
      expect(question?.id).toBe(session.elements[0].id);
    });

    it('should return next element after answer', () => {
      const session = engine.startSession('matching', 3);
      const firstElement = engine.getNextQuestion(session.sessionId);
      if (!firstElement) throw new Error('No element available');

      engine.submitAnswer(session.sessionId, firstElement.name);
      const secondElement = engine.getNextQuestion(session.sessionId);

      expect(secondElement).toBeDefined();
      expect(secondElement?.id).not.toBe(firstElement.id);
      expect(secondElement?.id).toBe(session.elements[1].id);
    });

    it('should return null when all questions answered', () => {
      const session = engine.startSession('matching', 3);
      const elements = session.elements;

      for (const element of elements) {
        engine.submitAnswer(session.sessionId, element.name);
      }

      const nextQuestion = engine.getNextQuestion(session.sessionId);
      expect(nextQuestion).toBeNull();
    });

    it('should track currentIndex correctly', () => {
      const session = engine.startSession('matching', 3);
      expect(session.currentIndex).toBe(0);

      const element1 = engine.getNextQuestion(session.sessionId);
      if (!element1) throw new Error('No element available');
      engine.submitAnswer(session.sessionId, element1.name);

      const updatedSession = engine.getSession(session.sessionId);
      expect(updatedSession.currentIndex).toBe(1);
    });

    it('should throw error for non-existent session', () => {
      expect(() => engine.getNextQuestion('invalid_session')).toThrow(
        'Session invalid_session not found',
      );
    });
  });

  describe('endSession', () => {
    it('should end session without error', () => {
      const session = engine.startSession('matching', 3);
      expect(() => engine.endSession(session.sessionId)).not.toThrow();
    });

    it('should allow retrieving session after ending', () => {
      const session = engine.startSession('matching', 3);
      engine.endSession(session.sessionId);
      const retrieved = engine.getSession(session.sessionId);
      expect(retrieved).toBeDefined();
    });

    it('should preserve session data after ending', () => {
      const session = engine.startSession('matching', 3);
      const element = engine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      engine.submitAnswer(session.sessionId, element.name);
      const scoreBeforeEnd = engine.calculateScore(session.sessionId);

      engine.endSession(session.sessionId);
      const scoreAfterEnd = engine.calculateScore(session.sessionId);

      expect(scoreAfterEnd).toBe(scoreBeforeEnd);
    });

    it('should throw error for non-existent session', () => {
      expect(() => engine.endSession('invalid_session')).toThrow(
        'Session invalid_session not found',
      );
    });
  });

  describe('getSession', () => {
    it('should retrieve session by ID', () => {
      const session = engine.startSession('matching', 3);
      const retrieved = engine.getSession(session.sessionId);
      expect(retrieved).toEqual(session);
    });

    it('should throw error for non-existent session', () => {
      expect(() => engine.getSession('invalid_session')).toThrow(
        'Session invalid_session not found',
      );
    });

    it('should return updated session after answer', () => {
      const session = engine.startSession('matching', 3);
      const element = engine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      engine.submitAnswer(session.sessionId, element.name);
      const updated = engine.getSession(session.sessionId);

      expect(updated.correctCount).toBe(1);
      expect(updated.score).toBe(10);
      expect(updated.answers.length).toBe(1);
    });
  });

  describe('startAnswerTimer', () => {
    it('should start timer without error', () => {
      const session = engine.startSession('matching', 3);
      expect(() => engine.startAnswerTimer(session.sessionId)).not.toThrow();
    });

    it('should track response time when timer is started', () => {
      const session = engine.startSession('matching', 3);
      engine.startAnswerTimer(session.sessionId);

      const element = engine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, element.name);
      expect(answer.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should use session start time if timer not started', () => {
      const session = engine.startSession('matching', 3);
      const element = engine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      const answer = engine.submitAnswer(session.sessionId, element.name);
      expect(answer.responseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Complete Game Flow', () => {
    it('should complete a full matching game session', () => {
      const session = engine.startSession('matching', 3);
      const elements = session.elements.slice(0, 3);

      for (const element of elements) {
        const question = engine.getNextQuestion(session.sessionId);
        expect(question).toBeDefined();

        engine.submitAnswer(session.sessionId, element.name);
      }

      const finalSession = engine.getSession(session.sessionId);
      expect(finalSession.correctCount).toBe(3);
      expect(finalSession.score).toBe(30);
      expect(finalSession.answers.length).toBe(3);

      engine.endSession(session.sessionId);
      const endedSession = engine.getSession(session.sessionId);
      expect(endedSession.score).toBe(30);
    });

    it('should complete a full quiz game session', () => {
      const session = engine.startQuizSession(5);
      const elements = session.elements.slice(0, 2);

      for (const element of elements) {
        const question = engine.getNextQuestion(session.sessionId);
        expect(question).toBeDefined();

        engine.submitQuizAnswer(session.sessionId, element.type);
      }

      const finalSession = engine.getSession(session.sessionId);
      expect(finalSession.correctCount).toBe(2);
      expect(finalSession.score).toBe(20);

      engine.endSession(session.sessionId);
    });

    it('should track mixed correct and incorrect answers', () => {
      const session = engine.startSession('matching', 3);
      const element1 = engine.getNextQuestion(session.sessionId);
      if (!element1) throw new Error('No element available');

      engine.submitAnswer(session.sessionId, element1.name); // Correct
      engine.submitAnswer(session.sessionId, 'wrong'); // Incorrect
      engine.submitAnswer(session.sessionId, 'wrong'); // Incorrect

      const finalSession = engine.getSession(session.sessionId);
      expect(finalSession.correctCount).toBe(1);
      expect(finalSession.score).toBe(10);
      expect(finalSession.answers.length).toBe(3);
      expect(finalSession.answers[0].correct).toBe(true);
      expect(finalSession.answers[1].correct).toBe(false);
      expect(finalSession.answers[2].correct).toBe(false);
    });
  });
});
