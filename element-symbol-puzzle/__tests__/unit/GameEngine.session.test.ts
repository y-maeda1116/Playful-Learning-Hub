/**
 * Unit tests for GameEngine (split from GameEngine.test.ts, issue #37).
 * Test code moved unedited.
 */


import { GameEngine } from '../../src/core/GameEngine';
import { ElementContentManager } from '../../src/managers/ElementContentManager';

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
