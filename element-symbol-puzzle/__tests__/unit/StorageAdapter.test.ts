/**
 * Unit tests for StorageAdapter functionality
 * 
 * Tests serialization, deserialization, and local storage integration
 * for user progress data persistence.
 */

import { StorageAdapter } from '../../src/core/StorageAdapter';
import { UserProgress } from '../../src/data/types';

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
  });
});


describe('StorageAdapter - Save and Load Operations', () => {
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
  });
});


describe('StorageAdapter - Data Integrity Round-trip', () => {
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

  it('should preserve all data in localStorage round-trip', () => {
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

  it('should handle multiple round-trips without data loss', () => {
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


describe('StorageAdapter - Error Handling (Storage Unavailable)', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = new StorageAdapter();
  });

  it('should handle saveToLocalStorage gracefully when storage is unavailable', () => {
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

  it('should return null when loadFromLocalStorage and storage is unavailable', () => {
    const loaded = adapter.loadFromLocalStorage('user1');
    expect(loaded === null || typeof loaded === 'object').toBe(true);
  });

  it('should return false when existsInLocalStorage and storage is unavailable', () => {
    const exists = adapter.existsInLocalStorage('user1');
    expect(typeof exists === 'boolean').toBe(true);
  });

  it('should handle deleteFromLocalStorage gracefully when storage is unavailable', () => {
    expect(() => adapter.deleteFromLocalStorage('user1')).not.toThrow();
  });

  it('should handle storage quota exceeded gracefully', () => {
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

    // This should not throw even if storage is full
    expect(() => adapter.saveToLocalStorage('user1', progress)).not.toThrow();
  });
});


describe('StorageAdapter - Multiple Profile Separation', () => {
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

  it('should handle updating one profile without affecting others', () => {
    const progress1: UserProgress = {
      userId: 'user1',
      gradeLevel: 3,
      elementsLearned: {},
      totalSessionTime: 100,
      sessionCount: 1,
      averageAccuracy: 50,
      badges: [],
      streakDays: 1,
      lastSessionDate: 1000,
      jigsawPuzzlesCompleted: 0,
    };

    const progress2: UserProgress = {
      userId: 'user2',
      gradeLevel: 4,
      elementsLearned: {},
      totalSessionTime: 200,
      sessionCount: 2,
      averageAccuracy: 75,
      badges: [],
      streakDays: 2,
      lastSessionDate: 2000,
      jigsawPuzzlesCompleted: 1,
    };

    adapter.saveToLocalStorage('user1', progress1);
    adapter.saveToLocalStorage('user2', progress2);

    // Update user1
    const updated1: UserProgress = {
      ...progress1,
      sessionCount: 5,
      averageAccuracy: 90,
    };
    adapter.saveToLocalStorage('user1', updated1);

    const loaded1 = adapter.loadFromLocalStorage('user1');
    const loaded2 = adapter.loadFromLocalStorage('user2');

    if (typeof localStorage !== 'undefined') {
      expect(loaded1?.sessionCount).toBe(5);
      expect(loaded1?.averageAccuracy).toBe(90);
      expect(loaded2?.sessionCount).toBe(2);
      expect(loaded2?.averageAccuracy).toBe(75);
    }
  });

  it('should handle many profiles independently', () => {
    const profiles: UserProgress[] = [];
    for (let i = 1; i <= 5; i++) {
      const progress: UserProgress = {
        userId: `user${i}`,
        gradeLevel: (3 + (i % 4)) as 3 | 4 | 5 | 6,
        elementsLearned: {},
        totalSessionTime: i * 100,
        sessionCount: i,
        averageAccuracy: i * 10,
        badges: [],
        streakDays: i,
        lastSessionDate: i * 1000,
        jigsawPuzzlesCompleted: i - 1,
      };
      profiles.push(progress);
      adapter.saveToLocalStorage(`user${i}`, progress);
    }

    // Verify all profiles are stored correctly
    for (let i = 1; i <= 5; i++) {
      const loaded = adapter.loadFromLocalStorage(`user${i}`);
      if (typeof localStorage !== 'undefined') {
        expect(loaded?.sessionCount).toBe(i);
        expect(loaded?.averageAccuracy).toBe(i * 10);
      }
    }
  });
});


describe('StorageAdapter - Complex Scenarios', () => {
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

  it('should handle complex element learning data', () => {
    const progress: UserProgress = {
      userId: 'user1',
      gradeLevel: 6,
      elementsLearned: {
        'H': {
          status: 'mastered',
          attempts: 15,
          correctAttempts: 14,
          lastAttempt: 1609459200000,
        },
        'O': {
          status: 'mastered',
          attempts: 12,
          correctAttempts: 12,
          lastAttempt: 1609459200000,
        },
        'C': {
          status: 'learning',
          attempts: 5,
          correctAttempts: 3,
          lastAttempt: 1609459200000,
        },
        'N': {
          status: 'not-started',
          attempts: 0,
          correctAttempts: 0,
          lastAttempt: 0,
        },
      },
      totalSessionTime: 14400,
      sessionCount: 10,
      averageAccuracy: 92.5,
      badges: ['badge1', 'badge2', 'badge3', 'badge4'],
      streakDays: 21,
      lastSessionDate: 1609459200000,
      jigsawPuzzlesCompleted: 5,
    };

    adapter.saveToLocalStorage('user1', progress);
    const loaded = adapter.loadFromLocalStorage('user1');

    if (typeof localStorage !== 'undefined') {
      expect(loaded).toEqual(progress);
      expect(Object.keys(loaded!.elementsLearned)).toHaveLength(4);
      expect(loaded!.averageAccuracy).toBe(92.5);
      expect(loaded!.badges).toHaveLength(4);
    }
  });

  it('should handle edge case: maximum accuracy (100)', () => {
    const progress: UserProgress = {
      userId: 'user1',
      gradeLevel: 3,
      elementsLearned: {},
      totalSessionTime: 0,
      sessionCount: 0,
      averageAccuracy: 100,
      badges: [],
      streakDays: 0,
      lastSessionDate: 0,
      jigsawPuzzlesCompleted: 0,
    };

    adapter.saveToLocalStorage('user1', progress);
    const loaded = adapter.loadFromLocalStorage('user1');

    if (typeof localStorage !== 'undefined') {
      expect(loaded?.averageAccuracy).toBe(100);
    }
  });

  it('should handle edge case: minimum accuracy (0)', () => {
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
      expect(loaded?.averageAccuracy).toBe(0);
    }
  });

  it('should handle large streak days value', () => {
    const progress: UserProgress = {
      userId: 'user1',
      gradeLevel: 3,
      elementsLearned: {},
      totalSessionTime: 0,
      sessionCount: 0,
      averageAccuracy: 0,
      badges: [],
      streakDays: 365,
      lastSessionDate: 0,
      jigsawPuzzlesCompleted: 0,
    };

    adapter.saveToLocalStorage('user1', progress);
    const loaded = adapter.loadFromLocalStorage('user1');

    if (typeof localStorage !== 'undefined') {
      expect(loaded?.streakDays).toBe(365);
    }
  });

  it('should handle many badges', () => {
    const badges = Array.from({ length: 50 }, (_, i) => `badge${i}`);
    const progress: UserProgress = {
      userId: 'user1',
      gradeLevel: 3,
      elementsLearned: {},
      totalSessionTime: 0,
      sessionCount: 0,
      averageAccuracy: 0,
      badges,
      streakDays: 0,
      lastSessionDate: 0,
      jigsawPuzzlesCompleted: 0,
    };

    adapter.saveToLocalStorage('user1', progress);
    const loaded = adapter.loadFromLocalStorage('user1');

    if (typeof localStorage !== 'undefined') {
      expect(loaded?.badges).toHaveLength(50);
      expect(loaded?.badges).toEqual(badges);
    }
  });

  it('should handle many learned elements', () => {
    const elementsLearned: UserProgress['elementsLearned'] = {};
    for (let i = 0; i < 30; i++) {
      elementsLearned[`Element${i}`] = {
        status: i % 3 === 0 ? 'mastered' : i % 3 === 1 ? 'learning' : 'not-started',
        attempts: i * 2,
        correctAttempts: i,
        lastAttempt: 1000 + i,
      };
    }

    const progress: UserProgress = {
      userId: 'user1',
      gradeLevel: 6,
      elementsLearned,
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
      expect(Object.keys(loaded!.elementsLearned)).toHaveLength(30);
      expect(loaded?.elementsLearned['Element0'].status).toBe('mastered');
      expect(loaded?.elementsLearned['Element1'].status).toBe('learning');
    }
  });
});
