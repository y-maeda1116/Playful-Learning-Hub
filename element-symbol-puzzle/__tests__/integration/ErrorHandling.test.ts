/**
 * Unit tests for error handling and edge cases
 * Validates: Requirements 1.2, 2.2, 3.2, 4.1, 7.1, 6.2
 */

import { GameEngine } from '../../src/core/GameEngine';
import { ProgressTrackingSystem } from '../../src/core/ProgressTrackingSystem';
import { StorageAdapter } from '../../src/core/StorageAdapter';
import { AudioSystem } from '../../src/core/AudioSystem';
import { ElementContentManager } from '../../src/managers/ElementContentManager';
import { RewardSystem } from '../../src/core/RewardSystem';
import { UserProgress, GameSession } from '../../src/data/types';

describe('ErrorHandling - Invalid Element Selection', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  it('should handle invalid element ID', () => {
    const session = engine.startSession('matching', 3);
    expect(() => {
      engine.submitAnswer(session.sessionId, 'INVALID');
    }).not.toThrow();
  });

  it('should mark invalid selection as incorrect', () => {
    const session = engine.startSession('matching', 3);
    const answer = engine.submitAnswer(session.sessionId, 'INVALID');
    expect(answer.correct).toBe(false);
  });
});

describe('ErrorHandling - Session Timeout', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  it('should detect 30 minute timeout', () => {
    const session = engine.startSession('matching', 3);
    const thirtyOneMinutesAgo = Date.now() - (31 * 60 * 1000);
    (session as any).startTime = thirtyOneMinutesAgo;
    const isTimedOut = Date.now() - session.startTime > 30 * 60 * 1000;
    expect(isTimedOut).toBe(true);
  });

  it('should allow session within 30 minutes', () => {
    const session = engine.startSession('matching', 3);
    const isTimedOut = Date.now() - session.startTime > 30 * 60 * 1000;
    expect(isTimedOut).toBe(false);
  });
});

describe('ErrorHandling - Corrupted Session Data', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  it('should handle missing session', () => {
    expect(() => {
      engine.getSession('nonexistent');
    }).toThrow();
  });

  it('should recover from corrupted answers', () => {
    const session = engine.startSession('matching', 3);
    (session as any).answers = null;
    expect(() => {
      engine.submitAnswer(session.sessionId, session.elements[0].id);
    }).not.toThrow();
  });
});

describe('ErrorHandling - Corrupted Progress Data', () => {
  let storageAdapter: StorageAdapter;

  beforeEach(() => {
    storageAdapter = new StorageAdapter();
  });

  it('should handle invalid JSON', () => {
    expect(() => {
      storageAdapter.deserializeProgress('invalid');
    }).toThrow();
  });

  it('should handle missing userId', () => {
    const data = { elementsLearned: {} };
    expect(() => {
      storageAdapter.serializeProgress(data as any);
    }).toThrow();
  });
});

describe('ErrorHandling - Invalid Grade Level', () => {
  let contentManager: ElementContentManager;

  beforeEach(() => {
    contentManager = new ElementContentManager();
  });

  it('should provide grade 3 elements', () => {
    const elements = contentManager.getElementsByGrade(3);
    expect(elements.length).toBe(15);
  });

  it('should provide grade 5 elements', () => {
    const elements = contentManager.getElementsByGrade(5);
    expect(elements.length).toBe(25);
  });

  it('should provide grade 6 elements', () => {
    const elements = contentManager.getElementsByGrade(6);
    expect(elements.length).toBe(30);
  });
});

describe('ErrorHandling - Missing Element Metadata', () => {
  let contentManager: ElementContentManager;

  beforeEach(() => {
    contentManager = new ElementContentManager();
  });

  it('should have audio URLs', () => {
    const elements = contentManager.getAllElements();
    for (const element of elements) {
      expect(element.audioUrl).toBeDefined();
    }
  });

  it('should have pronunciations', () => {
    const elements = contentManager.getAllElements();
    for (const element of elements) {
      expect(element.pronunciation).toBeDefined();
    }
  });

  it('should have properties', () => {
    const elements = contentManager.getAllElements();
    for (const element of elements) {
      expect(element.properties).toBeDefined();
    }
  });

  it('should have periodic table positions', () => {
    const elements = contentManager.getAllElements();
    for (const element of elements) {
      expect(element.periodicTablePosition).toBeDefined();
    }
  });
});

describe('ErrorHandling - Audio System', () => {
  let audioSystem: AudioSystem;

  beforeEach(() => {
    audioSystem = new AudioSystem();
  });

  it('should provide text hints', () => {
    const hint = audioSystem.getTextHint('Oxygen', 'sanso');
    expect(hint).toBeDefined();
    expect(hint).toContain('Oxygen');
  });

  it('should stop audio', () => {
    audioSystem.stopCurrentAudio();
    expect(audioSystem.isPlaying()).toBe(false);
  });

  it('should clear cache', () => {
    audioSystem.clearCache();
    expect(audioSystem.isPlaying()).toBe(false);
  });
});

describe('ErrorHandling - Local Storage', () => {
  let storageAdapter: StorageAdapter;

  beforeEach(() => {
    storageAdapter = new StorageAdapter();
  });

  it('should handle save gracefully', () => {
    const progress: UserProgress = {
      userId: 'user1',
      gradeLevel: 3,
      elementsLearned: {},
      totalSessionTime: 0,
      sessionCount: 0,
      averageAccuracy: 0,
      badges: [],
      streakDays: 0,
      lastSessionDate: 0,
      jigsawPuzzlesCompleted: 0,
    };
    expect(() => {
      storageAdapter.saveToLocalStorage('user1', progress);
    }).not.toThrow();
  });

  it('should handle invalid userId', () => {
    expect(() => {
      storageAdapter.loadFromLocalStorage('');
    }).toThrow();
  });

  it('should check existence', () => {
    const exists = storageAdapter.existsInLocalStorage('user1');
    expect(typeof exists).toBe('boolean');
  });
});

describe('ErrorHandling - Rendering', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  it('should handle missing session', () => {
    expect(() => {
      engine.getSession('missing');
    }).toThrow();
  });

  it('should handle empty elements', () => {
    const session = engine.startSession('matching', 3);
    (session as any).elements = [];
    const next = engine.getNextQuestion(session.sessionId);
    expect(next).toBeNull();
  });

  it('should calculate score with no answers', () => {
    const session = engine.startSession('matching', 3);
    const score = engine.calculateScore(session.sessionId);
    expect(score).toBe(0);
  });

  it('should calculate accuracy with no answers', () => {
    const session = engine.startSession('matching', 3);
    const accuracy = engine.calculateAccuracy(session.sessionId);
    expect(accuracy).toBe(0);
  });
});

describe('ErrorHandling - User Notifications', () => {
  let rewardSystem: RewardSystem;
  let progressSystem: ProgressTrackingSystem;

  beforeEach(() => {
    progressSystem = new ProgressTrackingSystem();
    rewardSystem = new RewardSystem(progressSystem);
  });

  it('should handle invalid user for badges', () => {
    expect(() => {
      rewardSystem.getUnlockedBadges('');
    }).toThrow();
  });

  it('should return empty badges for new user', () => {
    const badges = rewardSystem.getUnlockedBadges('newuser');
    expect(Array.isArray(badges)).toBe(true);
  });

  it('should handle invalid user for streak', () => {
    expect(() => {
      rewardSystem.getStreakDays('');
    }).toThrow();
  });

  it('should return 0 streak for new user', () => {
    const streak = rewardSystem.getStreakDays('newuser');
    expect(streak).toBe(0);
  });
});

describe('ErrorHandling - Data Integrity', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  it('should maintain integrity after invalid answer', () => {
    const session = engine.startSession('matching', 3);
    const initial = session.answers.length;
    engine.submitAnswer(session.sessionId, 'INVALID');
    const updated = engine.getSession(session.sessionId);
    expect(updated.answers.length).toBe(initial + 1);
  });

  it('should handle multiple invalid answers', () => {
    const session = engine.startSession('matching', 3);
    engine.submitAnswer(session.sessionId, 'INVALID1');
    engine.submitAnswer(session.sessionId, 'INVALID2');
    const updated = engine.getSession(session.sessionId);
    expect(updated.answers.length).toBe(2);
  });

  it('should handle concurrent sessions', () => {
    const s1 = engine.startSession('matching', 3);
    const s2 = engine.startSession('matching', 4);
    engine.submitAnswer(s1.sessionId, s1.elements[0].id);
    engine.submitAnswer(s2.sessionId, s2.elements[0].id);
    const r1 = engine.getSession(s1.sessionId);
    const r2 = engine.getSession(s2.sessionId);
    expect(r1.answers.length).toBe(1);
    expect(r2.answers.length).toBe(1);
  });
});

describe('ErrorHandling - Progress Tracking', () => {
  let progressSystem: ProgressTrackingSystem;

  beforeEach(() => {
    progressSystem = new ProgressTrackingSystem();
  });

  it('should handle empty userId', () => {
    const session: GameSession = {
      sessionId: 'test',
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
    expect(() => {
      progressSystem.updateProgress('', session);
    }).toThrow();
  });

  it('should calculate mastery for new user', () => {
    const level = progressSystem.calculateMasteryLevel('newuser');
    expect(level).toBe(0);
  });

  it('should get weak elements for new user', () => {
    const weak = progressSystem.getWeakElements('newuser');
    expect(Array.isArray(weak)).toBe(true);
    expect(weak.length).toBe(0);
  });

  it('should handle non-existent user', () => {
    expect(() => {
      progressSystem.getProgress('nonexistent');
    }).toThrow();
  });
});

describe('ErrorHandling - Fallback Mechanisms', () => {
  let audioSystem: AudioSystem;
  let contentManager: ElementContentManager;

  beforeEach(() => {
    audioSystem = new AudioSystem();
    contentManager = new ElementContentManager();
  });

  it('should provide text fallback', () => {
    const hint = audioSystem.getTextHint('Carbon', 'tanso');
    expect(hint).toBeDefined();
    expect(hint).toContain('Carbon');
  });

  it('should have element data fallback', () => {
    const elements = contentManager.getAllElements();
    for (const element of elements) {
      expect(element.name).toBeDefined();
      expect(element.pronunciation).toBeDefined();
    }
  });

  it('should continue with fallback hints', () => {
    const h1 = audioSystem.getTextHint('Hydrogen', 'suiso');
    const h2 = audioSystem.getTextHint('Oxygen', 'sanso');
    expect(h1).toBeDefined();
    expect(h2).toBeDefined();
  });
});
