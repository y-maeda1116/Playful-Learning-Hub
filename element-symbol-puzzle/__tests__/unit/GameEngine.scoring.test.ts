/**
 * Unit tests for GameEngine (split from GameEngine.test.ts, issue #37).
 * Test code moved unedited.
 */


import { GameEngine } from '../../src/core/GameEngine';
import { ElementContentManager } from '../../src/managers/ElementContentManager';

describe('GameEngine - Score Calculation', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe('calculateScore', () => {
    it('should return 0 for new session', () => {
      const session = engine.startSession('matching', 3);
      const score = engine.calculateScore(session.sessionId);
      expect(score).toBe(0);
    });

    it('should increase score by 10 for correct answer', () => {
      const session = engine.startSession('matching', 3);
      const currentElement = engine.getNextQuestion(session.sessionId);
      if (!currentElement) throw new Error('No element available');

      engine.submitAnswer(session.sessionId, currentElement.name);
      const score = engine.calculateScore(session.sessionId);
      expect(score).toBe(10);
    });

    it('should not increase score for incorrect answer', () => {
      const session = engine.startSession('matching', 3);
      engine.submitAnswer(session.sessionId, 'wrong answer');
      const score = engine.calculateScore(session.sessionId);
      expect(score).toBe(0);
    });

    it('should accumulate score for multiple correct answers', () => {
      const session = engine.startSession('matching', 3);
      const elements = session.elements.slice(0, 3);

      for (const element of elements) {
        engine.submitAnswer(session.sessionId, element.name);
      }

      const score = engine.calculateScore(session.sessionId);
      expect(score).toBe(30);
    });

    it('should accumulate score for mixed correct and incorrect answers', () => {
      const session = engine.startSession('matching', 3);
      const element1 = engine.getNextQuestion(session.sessionId);
      if (!element1) throw new Error('No element available');

      engine.submitAnswer(session.sessionId, element1.name); // Correct: +10
      engine.submitAnswer(session.sessionId, 'wrong'); // Incorrect: +0
      engine.submitAnswer(session.sessionId, 'wrong'); // Incorrect: +0

      const score = engine.calculateScore(session.sessionId);
      expect(score).toBe(10);
    });

    it('should throw error for non-existent session', () => {
      expect(() => engine.calculateScore('invalid_session')).toThrow(
        'Session invalid_session not found',
      );
    });
  });

  describe('calculateAccuracy', () => {
    it('should return 0 for new session', () => {
      const session = engine.startSession('matching', 3);
      const accuracy = engine.calculateAccuracy(session.sessionId);
      expect(accuracy).toBe(0);
    });

    it('should return 100 for all correct answers', () => {
      const session = engine.startSession('matching', 3);
      // Answer all elements in the session
      for (const element of session.elements) {
        engine.submitAnswer(session.sessionId, element.name);
      }

      const accuracy = engine.calculateAccuracy(session.sessionId);
      expect(accuracy).toBe(100);
    });

    it('should return 0 for all incorrect answers', () => {
      const session = engine.startSession('matching', 3);
      engine.submitAnswer(session.sessionId, 'wrong');
      engine.submitAnswer(session.sessionId, 'wrong');
      engine.submitAnswer(session.sessionId, 'wrong');

      const accuracy = engine.calculateAccuracy(session.sessionId);
      expect(accuracy).toBe(0);
    });

    it('should return 50 for half correct answers', () => {
      const session = engine.startSession('matching', 3);
      // With 15 elements, 7 correct = 46.67%, 8 correct = 53.33%
      // Let's test with a more precise scenario: answer all but check the calculation
      const halfCount = Math.floor(session.elements.length / 2);

      for (let i = 0; i < halfCount; i++) {
        engine.submitAnswer(session.sessionId, session.elements[i].name); // Correct
      }

      for (let i = halfCount; i < session.elements.length; i++) {
        engine.submitAnswer(session.sessionId, 'wrong'); // Incorrect
      }

      const accuracy = engine.calculateAccuracy(session.sessionId);
      // With 15 elements and 7 correct: 7/15 = 46.67%
      expect(accuracy).toBeCloseTo(46.67, 1);
    });

    it('should calculate accuracy as percentage', () => {
      const session = engine.startSession('matching', 3);
      // For a session with 15 elements, 5 correct = 33.33%
      for (let i = 0; i < 5; i++) {
        engine.submitAnswer(session.sessionId, session.elements[i].name); // Correct
      }

      for (let i = 5; i < session.elements.length; i++) {
        engine.submitAnswer(session.sessionId, 'wrong'); // Incorrect
      }

      const accuracy = engine.calculateAccuracy(session.sessionId);
      expect(accuracy).toBeCloseTo(33.33, 1);
    });

    it('should throw error for non-existent session', () => {
      expect(() => engine.calculateAccuracy('invalid_session')).toThrow(
        'Session invalid_session not found',
      );
    });
  });

  describe('calculateAverageResponseTime', () => {
    it('should return 0 for new session', () => {
      const session = engine.startSession('matching', 3);
      const avgTime = engine.calculateAverageResponseTime(session.sessionId);
      expect(avgTime).toBe(0);
    });

    it('should calculate average response time', () => {
      const session = engine.startSession('matching', 3);
      const element1 = engine.getNextQuestion(session.sessionId);
      if (!element1) throw new Error('No element available');

      engine.startAnswerTimer(session.sessionId);
      engine.submitAnswer(session.sessionId, element1.name);

      const avgTime = engine.calculateAverageResponseTime(session.sessionId);
      expect(avgTime).toBeGreaterThanOrEqual(0);
      expect(typeof avgTime).toBe('number');
    });

    it('should calculate average for multiple answers', () => {
      const session = engine.startSession('matching', 3);
      const elements = session.elements.slice(0, 2);

      for (const element of elements) {
        engine.startAnswerTimer(session.sessionId);
        engine.submitAnswer(session.sessionId, element.name);
      }

      const avgTime = engine.calculateAverageResponseTime(session.sessionId);
      expect(avgTime).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for non-existent session', () => {
      expect(() => engine.calculateAverageResponseTime('invalid_session')).toThrow(
        'Session invalid_session not found',
      );
    });
  });
});
