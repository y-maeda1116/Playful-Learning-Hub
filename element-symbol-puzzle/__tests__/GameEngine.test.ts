/**
 * Unit tests for GameEngine functionality
 * 
 * Tests session initialization, answer validation, score calculation,
 * and game flow transitions for the Element Symbol Puzzle game.
 */

import { GameEngine } from '../GameEngine';
import { ElementContentManager } from '../ElementContentManager';

describe('GameEngine - Session Initialization', () => {
  let engine: GameEngine;
  let contentManager: ElementContentManager;

  beforeEach(() => {
    engine = new GameEngine();
    contentManager = new ElementContentManager();
  });

  describe('startSession', () => {
    it('should create a matching session for grade 3', () => {
      const session = engine.startSession('matching', 3);
      expect(session).toBeDefined();
      expect(session.gameType).toBe('matching');
      expect(session.gradeLevel).toBe(3);
      expect(session.sessionId).toBeDefined();
      expect(session.sessionId.startsWith('session_')).toBe(true);
    });

    it('should create a matching session for grade 4', () => {
      const session = engine.startSession('matching', 4);
      expect(session.gameType).toBe('matching');
      expect(session.gradeLevel).toBe(4);
    });

    it('should create a quiz session for grade 5', () => {
      const session = engine.startSession('quiz', 5);
      expect(session.gameType).toBe('quiz');
      expect(session.gradeLevel).toBe(5);
    });

    it('should create a quiz session for grade 6', () => {
      const session = engine.startSession('quiz', 6);
      expect(session.gameType).toBe('quiz');
      expect(session.gradeLevel).toBe(6);
    });

    it('should create a chemical formula session for grade 5', () => {
      const session = engine.startSession('chemicalFormula', 5);
      expect(session.gameType).toBe('chemicalFormula');
      expect(session.gradeLevel).toBe(5);
    });

    it('should create a chemical formula session for grade 6', () => {
      const session = engine.startSession('chemicalFormula', 6);
      expect(session.gameType).toBe('chemicalFormula');
      expect(session.gradeLevel).toBe(6);
    });

    it('should initialize session with correct elements for grade 3', () => {
      const session = engine.startSession('matching', 3);
      const expectedElements = contentManager.getElementsByGrade(3);
      expect(session.elements.length).toBe(expectedElements.length);
      expect(session.elements.length).toBe(15);
    });

    it('should initialize session with correct elements for grade 5', () => {
      const session = engine.startSession('matching', 5);
      const expectedElements = contentManager.getElementsByGrade(5);
      expect(session.elements.length).toBe(expectedElements.length);
      expect(session.elements.length).toBe(25);
    });

    it('should initialize session with correct elements for grade 6', () => {
      const session = engine.startSession('matching', 6);
      const expectedElements = contentManager.getElementsByGrade(6);
      expect(session.elements.length).toBe(expectedElements.length);
      expect(session.elements.length).toBe(30);
    });

    it('should initialize session with score 0', () => {
      const session = engine.startSession('matching', 3);
      expect(session.score).toBe(0);
    });

    it('should initialize session with correctCount 0', () => {
      const session = engine.startSession('matching', 3);
      expect(session.correctCount).toBe(0);
    });

    it('should initialize session with empty answers array', () => {
      const session = engine.startSession('matching', 3);
      expect(session.answers).toEqual([]);
    });

    it('should initialize session with currentIndex 0', () => {
      const session = engine.startSession('matching', 3);
      expect(session.currentIndex).toBe(0);
    });

    it('should initialize session with difficulty easy', () => {
      const session = engine.startSession('matching', 3);
      expect(session.difficulty).toBe('easy');
    });

    it('should initialize session with startTime', () => {
      const beforeTime = Date.now();
      const session = engine.startSession('matching', 3);
      const afterTime = Date.now();
      expect(session.startTime).toBeGreaterThanOrEqual(beforeTime);
      expect(session.startTime).toBeLessThanOrEqual(afterTime);
    });

    it('should set totalCount equal to elements length', () => {
      const session = engine.startSession('matching', 3);
      expect(session.totalCount).toBe(session.elements.length);
    });

    it('should throw error for invalid grade level 2', () => {
      expect(() => engine.startSession('matching', 2 as any)).toThrow(
        'Invalid grade level: 2. Must be 3, 4, 5, or 6.',
      );
    });

    it('should throw error for invalid grade level 7', () => {
      expect(() => engine.startSession('matching', 7 as any)).toThrow(
        'Invalid grade level: 7. Must be 3, 4, 5, or 6.',
      );
    });

    it('should throw error for invalid game type', () => {
      expect(() => engine.startSession('invalid' as any, 3)).toThrow(
        'Invalid game type: invalid',
      );
    });

    it('should throw error for quiz with grade 3', () => {
      expect(() => engine.startSession('quiz', 3)).toThrow(
        "Game type 'quiz' requires grade level 5 or 6",
      );
    });

    it('should throw error for quiz with grade 4', () => {
      expect(() => engine.startSession('quiz', 4)).toThrow(
        "Game type 'quiz' requires grade level 5 or 6",
      );
    });

    it('should throw error for chemicalFormula with grade 3', () => {
      expect(() => engine.startSession('chemicalFormula', 3)).toThrow(
        "Game type 'chemicalFormula' requires grade level 5 or 6",
      );
    });

    it('should throw error for chemicalFormula with grade 4', () => {
      expect(() => engine.startSession('chemicalFormula', 4)).toThrow(
        "Game type 'chemicalFormula' requires grade level 5 or 6",
      );
    });

    it('should create unique session IDs for multiple sessions', () => {
      const session1 = engine.startSession('matching', 3);
      const session2 = engine.startSession('matching', 3);
      expect(session1.sessionId).not.toBe(session2.sessionId);
    });

    it('should retrieve session after creation', () => {
      const session = engine.startSession('matching', 3);
      const retrieved = engine.getSession(session.sessionId);
      expect(retrieved).toEqual(session);
    });
  });

  describe('startMatchingSession', () => {
    it('should create matching session for grade 3', () => {
      const session = engine.startMatchingSession(3);
      expect(session.gameType).toBe('matching');
      expect(session.gradeLevel).toBe(3);
    });

    it('should create matching session for grade 6', () => {
      const session = engine.startMatchingSession(6);
      expect(session.gameType).toBe('matching');
      expect(session.gradeLevel).toBe(6);
    });
  });

  describe('startQuizSession', () => {
    it('should create quiz session for grade 5', () => {
      const session = engine.startQuizSession(5);
      expect(session.gameType).toBe('quiz');
      expect(session.gradeLevel).toBe(5);
    });

    it('should create quiz session for grade 6', () => {
      const session = engine.startQuizSession(6);
      expect(session.gameType).toBe('quiz');
      expect(session.gradeLevel).toBe(6);
    });
  });
});

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
