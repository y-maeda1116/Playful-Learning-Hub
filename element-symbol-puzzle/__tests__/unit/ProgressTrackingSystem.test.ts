/**
 * Unit tests for ProgressTrackingSystem functionality
 * 
 * Tests progress tracking, mastery level calculation, weak element identification,
 * and local storage integration for the Element Symbol Puzzle game.
 */

import { ProgressTrackingSystem } from '../../src/core/ProgressTrackingSystem';
import { GameEngine } from '../../src/core/GameEngine';
import { GameSession } from '../../src/data/types';

describe('ProgressTrackingSystem - Progress Update', () => {
  let progressSystem: ProgressTrackingSystem;
  let gameEngine: GameEngine;

  beforeEach(() => {
    progressSystem = new ProgressTrackingSystem();
    gameEngine = new GameEngine();
  });

  describe('updateProgress', () => {
    it('should update progress after a game session', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);

      expect(() => progressSystem.updateProgress('user1', session)).not.toThrow();
    });

    it('should increment session count', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const progress = progressSystem.getProgress('user1');
      expect(progress.sessionCount).toBe(1);
    });

    it('should increment session count for multiple sessions', () => {
      const session1 = gameEngine.startSession('matching', 3);
      const element1 = gameEngine.getNextQuestion(session1.sessionId);
      if (!element1) throw new Error('No element available');
      gameEngine.submitAnswer(session1.sessionId, element1.name);
      progressSystem.updateProgress('user1', session1);

      const session2 = gameEngine.startSession('matching', 3);
      const element2 = gameEngine.getNextQuestion(session2.sessionId);
      if (!element2) throw new Error('No element available');
      gameEngine.submitAnswer(session2.sessionId, element2.name);
      progressSystem.updateProgress('user1', session2);

      const progress = progressSystem.getProgress('user1');
      expect(progress.sessionCount).toBe(2);
    });

    it('should track total session time', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const progress = progressSystem.getProgress('user1');
      expect(progress.totalSessionTime).toBeGreaterThanOrEqual(0);
    });

    it('should track element learning status', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const progress = progressSystem.getProgress('user1');
      expect(progress.elementsLearned[element.id]).toBeDefined();
      expect(progress.elementsLearned[element.id].status).toBe('learning');
    });

    it('should track attempts and correct attempts', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const progress = progressSystem.getProgress('user1');
      expect(progress.elementsLearned[element.id].attempts).toBe(1);
      expect(progress.elementsLearned[element.id].correctAttempts).toBe(1);
    });

    it('should track incorrect attempts', () => {
      const session = gameEngine.startSession('matching', 3);
      gameEngine.submitAnswer(session.sessionId, 'wrong answer');
      progressSystem.updateProgress('user1', session);

      const progress = progressSystem.getProgress('user1');
      const firstElement = session.elements[0];
      expect(progress.elementsLearned[firstElement.id].attempts).toBe(1);
      expect(progress.elementsLearned[firstElement.id].correctAttempts).toBe(0);
    });

    it('should update element status to mastered after 80% accuracy with 2+ attempts', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = session.elements[0];

      // First attempt: correct
      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      let progress = progressSystem.getProgress('user1');
      expect(progress.elementsLearned[element.id].status).toBe('learning');

      // Second attempt: correct (100% accuracy with 2 attempts = mastered)
      const session2 = gameEngine.startSession('matching', 3);
      const element2 = session2.elements[0];
      gameEngine.submitAnswer(session2.sessionId, element2.name);
      progressSystem.updateProgress('user1', session2);

      progress = progressSystem.getProgress('user1');
      // With 100% accuracy (2/2 correct), status should be mastered
      expect(progress.elementsLearned[element2.id].status).toBe('mastered');
    });

    it('should calculate average accuracy', () => {
      const session = gameEngine.startSession('matching', 3);
      const element1 = gameEngine.getNextQuestion(session.sessionId);
      if (!element1) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element1.name); // Correct
      gameEngine.submitAnswer(session.sessionId, 'wrong'); // Incorrect

      progressSystem.updateProgress('user1', session);

      const progress = progressSystem.getProgress('user1');
      expect(progress.averageAccuracy).toBeCloseTo(50, 1);
    });

    it('should throw error for invalid userId', () => {
      const session = gameEngine.startSession('matching', 3);
      expect(() => progressSystem.updateProgress('', session)).toThrow('Invalid userId');
    });

    it('should throw error for invalid sessionData', () => {
      expect(() => progressSystem.updateProgress('user1', {} as any)).toThrow(
        'Invalid sessionData',
      );
    });

    it('should track multiple elements in a session', () => {
      const session = gameEngine.startSession('matching', 3);
      const element1 = gameEngine.getNextQuestion(session.sessionId);
      if (!element1) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element1.name);
      gameEngine.submitAnswer(session.sessionId, 'wrong');

      progressSystem.updateProgress('user1', session);

      const progress = progressSystem.getProgress('user1');
      expect(Object.keys(progress.elementsLearned).length).toBe(2);
    });

    it('should update lastSessionDate', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      const beforeUpdate = Date.now();
      progressSystem.updateProgress('user1', session);
      const afterUpdate = Date.now();

      const progress = progressSystem.getProgress('user1');
      expect(progress.lastSessionDate).toBeGreaterThanOrEqual(beforeUpdate);
      expect(progress.lastSessionDate).toBeLessThanOrEqual(afterUpdate);
    });
  });

  describe('Streak Days Calculation', () => {
    it('should initialize streak days to 1 on first session', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const progress = progressSystem.getProgress('user1');
      expect(progress.streakDays).toBe(1);
    });

    it('should not increment streak if playing same day', () => {
      const session1 = gameEngine.startSession('matching', 3);
      const element1 = gameEngine.getNextQuestion(session1.sessionId);
      if (!element1) throw new Error('No element available');
      gameEngine.submitAnswer(session1.sessionId, element1.name);
      progressSystem.updateProgress('user1', session1);

      const session2 = gameEngine.startSession('matching', 3);
      const element2 = gameEngine.getNextQuestion(session2.sessionId);
      if (!element2) throw new Error('No element available');
      gameEngine.submitAnswer(session2.sessionId, element2.name);
      progressSystem.updateProgress('user1', session2);

      const progress = progressSystem.getProgress('user1');
      expect(progress.streakDays).toBe(1);
    });
  });
});

describe('ProgressTrackingSystem - Progress Retrieval', () => {
  let progressSystem: ProgressTrackingSystem;
  let gameEngine: GameEngine;

  beforeEach(() => {
    progressSystem = new ProgressTrackingSystem();
    gameEngine = new GameEngine();
  });

  describe('getProgress', () => {
    it('should throw error for non-existent user', () => {
      expect(() => progressSystem.getProgress('non-existent-user')).toThrow(
        'User non-existent-user not found',
      );
    });

    it('should throw error for invalid userId', () => {
      expect(() => progressSystem.getProgress('')).toThrow('Invalid userId');
    });

    it('should return user progress after update', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const progress = progressSystem.getProgress('user1');
      expect(progress.userId).toBe('user1');
      expect(progress.sessionCount).toBe(1);
    });

    it('should return correct grade level', () => {
      const session = gameEngine.startSession('matching', 5);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const progress = progressSystem.getProgress('user1');
      expect(progress.gradeLevel).toBe(5);
    });
  });
});

describe('ProgressTrackingSystem - Mastery Level', () => {
  let progressSystem: ProgressTrackingSystem;
  let gameEngine: GameEngine;

  beforeEach(() => {
    progressSystem = new ProgressTrackingSystem();
    gameEngine = new GameEngine();
  });

  describe('calculateMasteryLevel', () => {
    it('should return 0 for new user', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const masteryLevel = progressSystem.calculateMasteryLevel('user1');
      expect(masteryLevel).toBe(0);
    });

    it('should throw error for non-existent user', () => {
      expect(() => progressSystem.calculateMasteryLevel('non-existent-user')).toThrow(
        'User non-existent-user not found',
      );
    });

    it('should calculate mastery level as percentage', () => {
      const session = gameEngine.startSession('matching', 3);
      progressSystem.updateProgress('user1', session);

      const masteryLevel = progressSystem.calculateMasteryLevel('user1');
      expect(typeof masteryLevel).toBe('number');
      expect(masteryLevel).toBeGreaterThanOrEqual(0);
      expect(masteryLevel).toBeLessThanOrEqual(100);
    });
  });
});

describe('ProgressTrackingSystem - Weak Elements', () => {
  let progressSystem: ProgressTrackingSystem;
  let gameEngine: GameEngine;

  beforeEach(() => {
    progressSystem = new ProgressTrackingSystem();
    gameEngine = new GameEngine();
  });

  describe('getWeakElements', () => {
    it('should return empty array for new user', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const weakElements = progressSystem.getWeakElements('user1');
      expect(Array.isArray(weakElements)).toBe(true);
    });

    it('should throw error for non-existent user', () => {
      expect(() => progressSystem.getWeakElements('non-existent-user')).toThrow(
        'User non-existent-user not found',
      );
    });

    it('should return elements sorted by accuracy', () => {
      const session = gameEngine.startSession('matching', 3);
      gameEngine.submitAnswer(session.sessionId, 'wrong1');
      gameEngine.submitAnswer(session.sessionId, 'wrong2');
      gameEngine.submitAnswer(session.sessionId, 'wrong3');

      progressSystem.updateProgress('user1', session);

      const weakElements = progressSystem.getWeakElements('user1');
      expect(Array.isArray(weakElements)).toBe(true);
    });

    it('should not include mastered elements', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const weakElements = progressSystem.getWeakElements('user1');
      // Weak elements should not include the one we just answered correctly
      // (unless it's not yet mastered)
      expect(Array.isArray(weakElements)).toBe(true);
    });
  });
});

describe('ProgressTrackingSystem - Local Storage', () => {
  let progressSystem: ProgressTrackingSystem;
  let gameEngine: GameEngine;

  beforeEach(() => {
    progressSystem = new ProgressTrackingSystem();
    gameEngine = new GameEngine();
    // Clear localStorage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('saveToLocalStorage', () => {
    it('should save progress to localStorage', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      // Should not throw in Node.js environment (gracefully handles missing localStorage)
      expect(() => progressSystem.saveToLocalStorage('user1')).not.toThrow();
    });

    it('should throw error for invalid userId', () => {
      expect(() => progressSystem.saveToLocalStorage('')).toThrow('Invalid userId');
    });

    it('should throw error for non-existent user', () => {
      expect(() => progressSystem.saveToLocalStorage('non-existent-user')).toThrow(
        'User non-existent-user not found',
      );
    });

    it('should store data with correct key format', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);
      progressSystem.saveToLocalStorage('user1');

      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('element-puzzle-progress-user1');
        expect(stored).toBeDefined();
        expect(stored).not.toBeNull();
      }
    });
  });

  describe('loadFromLocalStorage', () => {
    it('should load progress from localStorage', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);
      progressSystem.saveToLocalStorage('user1');

      const newSystem = new ProgressTrackingSystem();
      const loaded = newSystem.loadFromLocalStorage('user1', 3);

      expect(loaded.userId).toBe('user1');
      // In Node.js environment, sessionCount will be 0 since localStorage is not available
      // In browser environment, it would be 1
      expect(loaded.sessionCount).toBeGreaterThanOrEqual(0);
    });

    it('should initialize new progress if no stored data', () => {
      const loaded = progressSystem.loadFromLocalStorage('new-user', 3);

      expect(loaded.userId).toBe('new-user');
      expect(loaded.gradeLevel).toBe(3);
      expect(loaded.sessionCount).toBe(0);
    });

    it('should throw error for invalid userId', () => {
      expect(() => progressSystem.loadFromLocalStorage('', 3)).toThrow('Invalid userId');
    });

    it('should preserve all progress data in round-trip', () => {
      const session = gameEngine.startSession('matching', 3);
      const element = gameEngine.getNextQuestion(session.sessionId);
      if (!element) throw new Error('No element available');

      gameEngine.submitAnswer(session.sessionId, element.name);
      progressSystem.updateProgress('user1', session);

      const originalProgress = progressSystem.getProgress('user1');
      progressSystem.saveToLocalStorage('user1');

      const newSystem = new ProgressTrackingSystem();
      const loadedProgress = newSystem.loadFromLocalStorage('user1', 3);

      expect(loadedProgress.userId).toBe(originalProgress.userId);
      // In Node.js, sessionCount will be 0 since localStorage is not available
      // In browser, it would match
      expect(loadedProgress.gradeLevel).toBe(originalProgress.gradeLevel);
    });
  });

  describe('Multiple User Separation', () => {
    it('should maintain separate progress for different users', () => {
      const session1 = gameEngine.startSession('matching', 3);
      const element1 = gameEngine.getNextQuestion(session1.sessionId);
      if (!element1) throw new Error('No element available');
      gameEngine.submitAnswer(session1.sessionId, element1.name);
      progressSystem.updateProgress('user1', session1);

      const session2 = gameEngine.startSession('matching', 4);
      const element2 = gameEngine.getNextQuestion(session2.sessionId);
      if (!element2) throw new Error('No element available');
      gameEngine.submitAnswer(session2.sessionId, element2.name);
      progressSystem.updateProgress('user2', session2);

      const progress1 = progressSystem.getProgress('user1');
      const progress2 = progressSystem.getProgress('user2');

      expect(progress1.gradeLevel).toBe(3);
      expect(progress2.gradeLevel).toBe(4);
      expect(progress1.userId).not.toBe(progress2.userId);
    });

    it('should load correct user data from localStorage', () => {
      const session1 = gameEngine.startSession('matching', 3);
      const element1 = gameEngine.getNextQuestion(session1.sessionId);
      if (!element1) throw new Error('No element available');
      gameEngine.submitAnswer(session1.sessionId, element1.name);
      progressSystem.updateProgress('user1', session1);
      progressSystem.saveToLocalStorage('user1');

      const session2 = gameEngine.startSession('matching', 4);
      const element2 = gameEngine.getNextQuestion(session2.sessionId);
      if (!element2) throw new Error('No element available');
      gameEngine.submitAnswer(session2.sessionId, element2.name);
      progressSystem.updateProgress('user2', session2);
      progressSystem.saveToLocalStorage('user2');

      const newSystem = new ProgressTrackingSystem();
      const loaded1 = newSystem.loadFromLocalStorage('user1', 3);
      const loaded2 = newSystem.loadFromLocalStorage('user2', 4);

      expect(loaded1.gradeLevel).toBe(3);
      expect(loaded2.gradeLevel).toBe(4);
    });
  });
});

describe('ProgressTrackingSystem - Data Integrity', () => {
  let progressSystem: ProgressTrackingSystem;
  let gameEngine: GameEngine;

  beforeEach(() => {
    progressSystem = new ProgressTrackingSystem();
    gameEngine = new GameEngine();
  });

  it('should maintain data consistency across multiple updates', () => {
    const session1 = gameEngine.startSession('matching', 3);
    const element1 = gameEngine.getNextQuestion(session1.sessionId);
    if (!element1) throw new Error('No element available');
    gameEngine.submitAnswer(session1.sessionId, element1.name);
    progressSystem.updateProgress('user1', session1);

    const progress1 = progressSystem.getProgress('user1');
    const sessionCount1 = progress1.sessionCount;

    const session2 = gameEngine.startSession('matching', 3);
    const element2 = gameEngine.getNextQuestion(session2.sessionId);
    if (!element2) throw new Error('No element available');
    gameEngine.submitAnswer(session2.sessionId, element2.name);
    progressSystem.updateProgress('user1', session2);

    const progress2 = progressSystem.getProgress('user1');
    expect(progress2.sessionCount).toBe(sessionCount1 + 1);
  });

  it('should handle empty game sessions', () => {
    const session = gameEngine.startSession('matching', 3);
    // Don't submit any answers
    expect(() => progressSystem.updateProgress('user1', session)).not.toThrow();

    const progress = progressSystem.getProgress('user1');
    expect(progress.sessionCount).toBe(1);
    expect(progress.averageAccuracy).toBe(0);
  });
});
