/**
 * Unit tests for StorageAdapter functionality
 * 
 * Tests serialization, deserialization, and local storage integration
 * for user progress data persistence.
 */

import { StorageAdapter } from '../StorageAdapter';
import { UserProgress } from '../types';

describe('StorageAdapter - Serialization', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = new StorageAdapter();
  });

  describe('serializeProgress', () => {
    it('should serialize valid UserProgress to JSON string', () => {
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

      const serialized = adapter.serializeProgress(progress);
      expect(typeof serialized).toBe('string');
      expect(serialized).toContain('user1');
    });

    it('should produce valid JSON', () => {
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

      const serialized = adapter.serializeProgress(progress);
      expect(() => JSON.parse(serialized)).not.toThrow();
    });

    it('should preserve all progress data in serialization', () => {
      const progress: UserProgress = {
        userId: 'user1',
        gradeLevel: 5,
        elementsLearned: {
          'H': {
            status: 'mastered',
            attempts: 5,
            correctAttempts: 5,
            lastAttempt: 1000,
          },
        },
        totalSessionTime: 3600,
        sessionCount: 2,
        averageAccuracy: 95.5,
        badges: ['badge1', 'badge2'],
        streakDays: 7,
        lastSessionDate: 2000,
        jigsawPuzzlesCompleted: 1,
      };

      const serialized = adapter.serializeProgress(progress);
      const parsed = JSON.parse(serialized);

      expect(parsed.userId).toBe('user1');
      expect(parsed.gradeLevel).toBe(5);
      expect(parsed.sessionCount).toBe(2);
      expect(parsed.averageAccuracy).toBe(95.5);
      expect(parsed.badges).toEqual(['badge1', 'badge2']);
      expect(parsed.streakDays).toBe(7);
    });

    it('should throw error for null progress', () => {
      expect(() => adapter.serializeProgress(null as any)).toThrow('Invalid progress');
    });

    it('should throw error for progress without userId', () => {
      const progress = {
        gradeLevel: 3,
        elementsLearned: {},
      } as any;

      expect(() => adapter.serializeProgress(progress)).toThrow('Invalid progress');
    });

    it('should throw error for progress without elementsLearned', () => {
      const progress = {
        userId: 'user1',
        gradeLevel: 3,
      } as any;

      expect(() => adapter.serializeProgress(progress)).toThrow('Invalid progress');
    });

    it('should handle complex element data', () => {
      const progress: UserProgress = {
        userId: 'user1',
        gradeLevel: 6,
        elementsLearned: {
          'H': {
            status: 'mastered',
            attempts: 10,
            correctAttempts: 9,
            lastAttempt: 1000,
          },
          'O': {
            status: 'learning',
            attempts: 3,
            correctAttempts: 2,
            lastAttempt: 2000,
          },
          'C': {
            status: 'not-started',
            attempts: 0,
            correctAttempts: 0,
            lastAttempt: 0,
          },
        },
        totalSessionTime: 7200,
        sessionCount: 5,
        averageAccuracy: 87.3,
        badges: ['badge1', 'badge2', 'badge3'],
        streakDays: 14,
        lastSessionDate: 3000,
        jigsawPuzzlesCompleted: 2,
      };

      const serialized = adapter.serializeProgress(progress);
      const parsed = JSON.parse(serialized);

      expect(Object.keys(parsed.elementsLearned)).toHaveLength(3);
      expect(parsed.elementsLearned['H'].status).toBe('mastered');
      expect(parsed.elementsLearned['O'].status).toBe('learning');
    });
  });

  describe('deserializeProgress', () => {
    it('should deserialize valid JSON to UserProgress', () => {
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

      const serialized = JSON.stringify(progress);
      const deserialized = adapter.deserializeProgress(serialized);

      expect(deserialized.userId).toBe('user1');
      expect(deserialized.gradeLevel).toBe(3);
    });

    it('should preserve all data during deserialization', () => {
      const progress: UserProgress = {
        userId: 'user1',
        gradeLevel: 5,
        elementsLearned: {
          'H': {
            status: 'mastered',
            attempts: 5,
            correctAttempts: 5,
            lastAttempt: 1000,
          },
        },
        totalSessionTime: 3600,
        sessionCount: 2,
        averageAccuracy: 95.5,
        badges: ['badge1', 'badge2'],
        streakDays: 7,
        lastSessionDate: 2000,
        jigsawPuzzlesCompleted: 1,
      };

      const serialized = JSON.stringify(progress);
      const deserialized = adapter.deserializeProgress(serialized);

      expect(deserialized).toEqual(progress);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => adapter.deserializeProgress('not valid json')).toThrow('Failed to parse JSON');
    });

    it('should throw error for empty string', () => {
      expect(() => adapter.deserializeProgress('')).toThrow('Invalid JSON string');
    });

    it('should throw error for null', () => {
      expect(() => adapter.deserializeProgress(null as any)).toThrow('Invalid JSON string');
    });

    it('should throw error for corrupted userId', () => {
      const corrupted = JSON.stringify({
        userId: null,
        gradeLevel: 3,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: 0,
        averageAccuracy: 0,
        badges: [],
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      });

      expect(() => adapter.deserializeProgress(corrupted)).toThrow('Corrupted progress data');
    });

    it('should throw error for invalid gradeLevel', () => {
      const corrupted = JSON.stringify({
        userId: 'user1',
        gradeLevel: 10,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: 0,
        averageAccuracy: 0,
        badges: [],
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      });

      expect(() => adapter.deserializeProgress(corrupted)).toThrow('Corrupted progress data');
    });

    it('should throw error for invalid sessionCount', () => {
      const corrupted = JSON.stringify({
        userId: 'user1',
        gradeLevel: 3,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: -1,
        averageAccuracy: 0,
        badges: [],
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      });

      expect(() => adapter.deserializeProgress(corrupted)).toThrow('Corrupted progress data');
    });

    it('should throw error for invalid averageAccuracy', () => {
      const corrupted = JSON.stringify({
        userId: 'user1',
        gradeLevel: 3,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: 0,
        averageAccuracy: 150,
        badges: [],
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      });

      expect(() => adapter.deserializeProgress(corrupted)).toThrow('Corrupted progress data');
    });

    it('should throw error for invalid badges array', () => {
      const corrupted = JSON.stringify({
        userId: 'user1',
        gradeLevel: 3,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: 0,
        averageAccuracy: 0,
        badges: 'not-an-array',
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      });

      expect(() => adapter.deserializeProgress(corrupted)).toThrow('Corrupted progress data');
    });
  });

  describe('Round-trip serialization', () => {
    it('should preserve data through serialize-deserialize cycle', () => {
      const original: UserProgress = {
        userId: 'user1',
        gradeLevel: 5,
        elementsLearned: {
          'H': {
            status: 'mastered',
            attempts: 5,
            correctAttempts: 5,
            lastAttempt: 1000,
          },
          'O': {
            status: 'learning',
            attempts: 3,
            correctAttempts: 2,
            lastAttempt: 2000,
          },
        },
        totalSessionTime: 3600,
        sessionCount: 2,
        averageAccuracy: 95.5,
        badges: ['badge1', 'badge2'],
        streakDays: 7,
        lastSessionDate: 2000,
        jigsawPuzzlesCompleted: 1,
      };

      const serialized = adapter.serializeProgress(original);
      const deserialized = adapter.deserializeProgress(serialized);

      expect(deserialized).toEqual(original);
    });

    it('should handle multiple round-trips', () => {
      const original: UserProgress = {
        userId: 'user1',
        gradeLevel: 6,
        elementsLearned: {
          'H': {
            status: 'mastered',
            attempts: 10,
            correctAttempts: 10,
            lastAttempt: 1000,
          },
        },
        totalSessionTime: 7200,
        sessionCount: 5,
        averageAccuracy: 100,
        badges: ['badge1', 'badge2', 'badge3'],
        streakDays: 30,
        lastSessionDate: 3000,
        jigsawPuzzlesCompleted: 3,
      };

      let current = original;
      for (let i = 0; i < 3; i++) {
        const serialized = adapter.serializeProgress(current);
        current = adapter.deserializeProgress(serialized);
      }

      expect(current).toEqual(original);
    });
  });
});

describe('StorageAdapter - Local Storage Operations', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = new StorageAdapter();
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

      expect(() => adapter.saveToLocalStorage('user1', progress)).not.toThrow();
    });

    it('should throw error for invalid userId', () => {
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

      expect(() => adapter.saveToLocalStorage('', progress)).toThrow('Invalid userId');
    });

    it('should throw error for null progress', () => {
      expect(() => adapter.saveToLocalStorage('user1', null as any)).toThrow('Invalid progress');
    });

    it('should throw error for invalid progress', () => {
      expect(() => adapter.saveToLocalStorage('user1', {} as any)).toThrow('Invalid progress');
    });

    it('should store data with correct key format', () => {
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

      adapter.saveToLocalStorage('user1', progress);

      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('element-puzzle-progress-user1');
        expect(stored).toBeDefined();
        expect(stored).not.toBeNull();
      }
    });

    it('should overwrite existing data', () => {
      const progress1: UserProgress = {
        userId: 'user1',
        gradeLevel: 3,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: 1,
        averageAccuracy: 0,
        badges: [],
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      };

      const progress2: UserProgress = {
        userId: 'user1',
        gradeLevel: 3,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: 2,
        averageAccuracy: 0,
        badges: [],
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      };

      adapter.saveToLocalStorage('user1', progress1);
      adapter.saveToLocalStorage('user1', progress2);

      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('element-puzzle-progress-user1');
        const parsed = JSON.parse(stored!);
        expect(parsed.sessionCount).toBe(2);
      }
    });
  });

  describe('loadFromLocalStorage', () => {
    it('should load progress from localStorage', () => {
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

      adapter.saveToLocalStorage('user1', progress);
      const loaded = adapter.loadFromLocalStorage('user1');

      if (typeof localStorage !== 'undefined') {
        expect(loaded).not.toBeNull();
        expect(loaded?.userId).toBe('user1');
      }
    });

    it('should return null if no stored data', () => {
      const loaded = adapter.loadFromLocalStorage('non-existent-user');
      expect(loaded).toBeNull();
    });

    it('should throw error for invalid userId', () => {
      expect(() => adapter.loadFromLocalStorage('')).toThrow('Invalid userId');
    });

    it('should throw error for corrupted data', () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('element-puzzle-progress-user1', 'corrupted data');
        expect(() => adapter.loadFromLocalStorage('user1')).toThrow('Corrupted progress data');
      }
    });

    it('should preserve all data in round-trip', () => {
      const original: UserProgress = {
        userId: 'user1',
        gradeLevel: 5,
        elementsLearned: {
          'H': {
            status: 'mastered',
            attempts: 5,
            correctAttempts: 5,
            lastAttempt: 1000,
          },
        },
        totalSessionTime: 3600,
        sessionCount: 2,
        averageAccuracy: 95.5,
        badges: ['badge1', 'badge2'],
        streakDays: 7,
        lastSessionDate: 2000,
        jigsawPuzzlesCompleted: 1,
      };

      adapter.saveToLocalStorage('user1', original);
      const loaded = adapter.loadFromLocalStorage('user1');

      if (typeof localStorage !== 'undefined') {
        expect(loaded).toEqual(original);
      }
    });
  });

  describe('existsInLocalStorage', () => {
    it('should return true if progress exists', () => {
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

      adapter.saveToLocalStorage('user1', progress);
      const exists = adapter.existsInLocalStorage('user1');

      if (typeof localStorage !== 'undefined') {
        expect(exists).toBe(true);
      }
    });

    it('should return false if progress does not exist', () => {
      const exists = adapter.existsInLocalStorage('non-existent-user');
      expect(exists).toBe(false);
    });

    it('should throw error for invalid userId', () => {
      expect(() => adapter.existsInLocalStorage('')).toThrow('Invalid userId');
    });
  });

  describe('deleteFromLocalStorage', () => {
    it('should delete progress from localStorage', () => {
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

      adapter.saveToLocalStorage('user1', progress);
      adapter.deleteFromLocalStorage('user1');

      const exists = adapter.existsInLocalStorage('user1');
      expect(exists).toBe(false);
    });

    it('should throw error for invalid userId', () => {
      expect(() => adapter.deleteFromLocalStorage('')).toThrow('Invalid userId');
    });
  });

  describe('Multiple User Separation', () => {
    it('should maintain separate storage for different users', () => {
      const progress1: UserProgress = {
        userId: 'user1',
        gradeLevel: 3,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: 1,
        averageAccuracy: 0,
        badges: [],
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      };

      const progress2: UserProgress = {
        userId: 'user2',
        gradeLevel: 4,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: 2,
        averageAccuracy: 0,
        badges: [],
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      };

      adapter.saveToLocalStorage('user1', progress1);
      adapter.saveToLocalStorage('user2', progress2);

      const loaded1 = adapter.loadFromLocalStorage('user1');
      const loaded2 = adapter.loadFromLocalStorage('user2');

      if (typeof localStorage !== 'undefined') {
        expect(loaded1?.sessionCount).toBe(1);
        expect(loaded2?.sessionCount).toBe(2);
        expect(loaded1?.gradeLevel).toBe(3);
        expect(loaded2?.gradeLevel).toBe(4);
      }
    });

    it('should not affect other users when deleting', () => {
      const progress1: UserProgress = {
        userId: 'user1',
        gradeLevel: 3,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: 1,
        averageAccuracy: 0,
        badges: [],
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      };

      const progress2: UserProgress = {
        userId: 'user2',
        gradeLevel: 4,
        elementsLearned: {},
        totalSessionTime: 0,
        sessionCount: 2,
        averageAccuracy: 0,
        badges: [],
        streakDays: 0,
        lastSessionDate: 0,
        jigsawPuzzlesCompleted: 0,
      };

      adapter.saveToLocalStorage('user1', progress1);
      adapter.saveToLocalStorage('user2', progress2);
      adapter.deleteFromLocalStorage('user1');

      const loaded1 = adapter.loadFromLocalStorage('user1');
      const loaded2 = adapter.loadFromLocalStorage('user2');

      expect(loaded1).toBeNull();
      if (typeof localStorage !== 'undefined') {
        expect(loaded2).not.toBeNull();
        expect(loaded2?.sessionCount).toBe(2);
      }
    });
  });

  describe('Data Integrity', () => {
    it('should validate data on load', () => {
      if (typeof localStorage !== 'undefined') {
        const invalidData = JSON.stringify({
          userId: 'user1',
          gradeLevel: 99,
          elementsLearned: {},
          totalSessionTime: 0,
          sessionCount: 0,
          averageAccuracy: 0,
          badges: [],
          streakDays: 0,
          lastSessionDate: 0,
          jigsawPuzzlesCompleted: 0,
        });

        localStorage.setItem('element-puzzle-progress-user1', invalidData);
        expect(() => adapter.loadFromLocalStorage('user1')).toThrow('Corrupted progress data');
      }
    });

    it('should handle missing optional fields gracefully', () => {
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

      adapter.saveToLocalStorage('user1', progress);
      const loaded = adapter.loadFromLocalStorage('user1');

      if (typeof localStorage !== 'undefined') {
        expect(loaded).not.toBeNull();
        expect(loaded?.userId).toBe('user1');
      }
    });
  });
});
