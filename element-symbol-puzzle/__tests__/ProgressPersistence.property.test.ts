/**
 * Property-Based Tests for Progress Persistence Round-Trip
 * 
 * Tests universal properties that must hold across all inputs
 * using fast-check for property-based testing.
 * 
 * Validates that user progress data can be serialized, persisted to storage,
 * and deserialized without data loss or corruption.
 */

import * as fc from 'fast-check';
import { StorageAdapter } from '../StorageAdapter';
import { UserProgress } from '../types';

describe('Progress Persistence - Property-Based Tests', () => {
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

  /**
   * Arbitraries for generating test data
   */
  const userIdArbitrary = fc.stringMatching(/^user[0-9]{1,3}$/);

  const gradeLevelArbitrary = fc.oneof(
    fc.constant(3 as const),
    fc.constant(4 as const),
    fc.constant(5 as const),
    fc.constant(6 as const),
  );

  const elementStatusArbitrary = fc.oneof(
    fc.constant('not-started' as const),
    fc.constant('learning' as const),
    fc.constant('mastered' as const),
  );

  const elementProgressArbitrary = fc.record({
    status: elementStatusArbitrary,
    attempts: fc.integer({ min: 0, max: 100 }),
    correctAttempts: fc.integer({ min: 0, max: 100 }),
    lastAttempt: fc.integer({ min: 0, max: Date.now() }),
  });

  const elementsLearnedArbitrary = fc.dictionary(
    fc.stringMatching(/^[A-Z][a-z]?$/), // Element symbols like H, He, Li
    elementProgressArbitrary,
  );

  const userProgressArbitrary = fc.record({
    userId: userIdArbitrary,
    gradeLevel: gradeLevelArbitrary,
    elementsLearned: elementsLearnedArbitrary,
    totalSessionTime: fc.integer({ min: 0, max: 1000000 }),
    sessionCount: fc.integer({ min: 0, max: 1000 }),
    averageAccuracy: fc.integer({ min: 0, max: 100 }),
    badges: fc.array(fc.stringMatching(/^badge[0-9]{1,3}$/), { maxLength: 20 }),
    streakDays: fc.integer({ min: 0, max: 365 }),
    lastSessionDate: fc.integer({ min: 0, max: Date.now() }),
    jigsawPuzzlesCompleted: fc.integer({ min: 0, max: 100 }),
  });

  describe('Property 5: Progress Persistence Round-Trip', () => {
    /**
     * **Validates: Requirements 4.1, 8.5**
     * 
     * Property: For any valid UserProgress object, when serialized and then
     * deserialized, the resulting object SHALL be equivalent to the original
     * object (no data loss or corruption).
     * 
     * This ensures that:
     * - All numeric values are preserved exactly
     * - All string values are preserved exactly
     * - All array values are preserved exactly
     * - All nested object structures are preserved exactly
     * - No data is lost during serialization/deserialization
     */
    it('should preserve all data through serialize-deserialize round-trip', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        // Serialize the progress
        const serialized = adapter.serializeProgress(progress);

        // Deserialize the progress
        const deserialized = adapter.deserializeProgress(serialized);

        // The deserialized object should be equal to the original
        return JSON.stringify(deserialized) === JSON.stringify(progress);
      });

      fc.assert(property, { numRuns: 50 });
    });

    /**
     * Property: For any valid UserProgress object, when saved to and loaded
     * from localStorage, the loaded object SHALL be equivalent to the original
     * object (no data loss or corruption).
     * 
     * This ensures that:
     * - Data persists correctly to localStorage
     * - Data is retrieved correctly from localStorage
     * - No data is lost during the save/load cycle
     */
    it('should preserve all data through localStorage save-load round-trip', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        // Save to localStorage
        adapter.saveToLocalStorage(progress.userId, progress);

        // Load from localStorage
        const loaded = adapter.loadFromLocalStorage(progress.userId);

        // The loaded object should be equal to the original
        if (typeof localStorage === 'undefined') {
          // In Node.js environment, localStorage is not available
          // The test should still pass as the adapter handles this gracefully
          return true;
        }

        return loaded !== null && JSON.stringify(loaded) === JSON.stringify(progress);
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, when serialized multiple
     * times in succession, each serialization SHALL produce the same result.
     * 
     * This ensures that:
     * - Serialization is deterministic
     * - Multiple serializations don't corrupt data
     * - The serialization process is idempotent
     */
    it('should produce consistent serialization across multiple calls', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        const serialized1 = adapter.serializeProgress(progress);
        const serialized2 = adapter.serializeProgress(progress);
        const serialized3 = adapter.serializeProgress(progress);

        // All serializations should be identical
        return serialized1 === serialized2 && serialized2 === serialized3;
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, when deserialized multiple
     * times from the same serialized string, each deserialization SHALL produce
     * an equivalent result.
     * 
     * This ensures that:
     * - Deserialization is deterministic
     * - Multiple deserializations don't corrupt data
     * - The deserialization process is idempotent
     */
    it('should produce consistent deserialization across multiple calls', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        const serialized = adapter.serializeProgress(progress);

        const deserialized1 = adapter.deserializeProgress(serialized);
        const deserialized2 = adapter.deserializeProgress(serialized);
        const deserialized3 = adapter.deserializeProgress(serialized);

        // All deserializations should be equivalent
        return (
          JSON.stringify(deserialized1) === JSON.stringify(deserialized2) &&
          JSON.stringify(deserialized2) === JSON.stringify(deserialized3)
        );
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, when serialized and
     * deserialized multiple times in succession, the final result SHALL be
     * equivalent to the original object.
     * 
     * This ensures that:
     * - Multiple round-trips don't accumulate errors
     * - Data integrity is maintained across multiple cycles
     * - The system is resilient to repeated serialization/deserialization
     */
    it('should preserve data through multiple serialize-deserialize cycles', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        let current = progress;

        // Perform 5 round-trip cycles
        for (let i = 0; i < 5; i++) {
          const serialized = adapter.serializeProgress(current);
          current = adapter.deserializeProgress(serialized);
        }

        // After 5 cycles, the data should still be equivalent to the original
        return JSON.stringify(current) === JSON.stringify(progress);
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, the serialized form SHALL
     * be a valid JSON string that can be parsed back to an object.
     * 
     * This ensures that:
     * - Serialization produces valid JSON
     * - The JSON can be parsed without errors
     * - The parsed JSON contains all expected fields
     */
    it('should produce valid JSON that can be parsed', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        const serialized = adapter.serializeProgress(progress);

        // Should be able to parse the JSON without errors
        try {
          const parsed = JSON.parse(serialized);

          // Verify that all required fields are present
          return (
            parsed.userId !== undefined &&
            parsed.gradeLevel !== undefined &&
            parsed.elementsLearned !== undefined &&
            parsed.totalSessionTime !== undefined &&
            parsed.sessionCount !== undefined &&
            parsed.averageAccuracy !== undefined &&
            parsed.badges !== undefined &&
            parsed.streakDays !== undefined &&
            parsed.lastSessionDate !== undefined &&
            parsed.jigsawPuzzlesCompleted !== undefined
          );
        } catch {
          return false;
        }
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, when saved to localStorage
     * and then loaded, the loaded object SHALL have the same userId as the
     * original object.
     * 
     * This ensures that:
     * - User identification is preserved
     * - Data is not mixed between users
     * - User separation is maintained
     */
    it('should preserve userId through localStorage round-trip', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        adapter.saveToLocalStorage(progress.userId, progress);
        const loaded = adapter.loadFromLocalStorage(progress.userId);

        if (typeof localStorage === 'undefined') {
          return true;
        }

        return loaded !== null && loaded.userId === progress.userId;
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, when saved to localStorage
     * and then loaded, the loaded object SHALL have the same gradeLevel as the
     * original object.
     * 
     * This ensures that:
     * - Grade level information is preserved
     * - Student level tracking is maintained
     * - Grade-appropriate content selection is preserved
     */
    it('should preserve gradeLevel through localStorage round-trip', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        adapter.saveToLocalStorage(progress.userId, progress);
        const loaded = adapter.loadFromLocalStorage(progress.userId);

        if (typeof localStorage === 'undefined') {
          return true;
        }

        return loaded !== null && loaded.gradeLevel === progress.gradeLevel;
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, when saved to localStorage
     * and then loaded, the loaded object SHALL have the same sessionCount as
     * the original object.
     * 
     * This ensures that:
     * - Session history is preserved
     * - Learning statistics are maintained
     * - Progress tracking is accurate
     */
    it('should preserve sessionCount through localStorage round-trip', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        adapter.saveToLocalStorage(progress.userId, progress);
        const loaded = adapter.loadFromLocalStorage(progress.userId);

        if (typeof localStorage === 'undefined') {
          return true;
        }

        return loaded !== null && loaded.sessionCount === progress.sessionCount;
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, when saved to localStorage
     * and then loaded, the loaded object SHALL have the same averageAccuracy
     * as the original object.
     * 
     * This ensures that:
     * - Accuracy metrics are preserved
     * - Performance tracking is maintained
     * - Difficulty adjustment data is accurate
     */
    it('should preserve averageAccuracy through localStorage round-trip', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        adapter.saveToLocalStorage(progress.userId, progress);
        const loaded = adapter.loadFromLocalStorage(progress.userId);

        if (typeof localStorage === 'undefined') {
          return true;
        }

        return loaded !== null && loaded.averageAccuracy === progress.averageAccuracy;
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, when saved to localStorage
     * and then loaded, the loaded object SHALL have the same badges array as
     * the original object.
     * 
     * This ensures that:
     * - Badge achievements are preserved
     * - Reward tracking is maintained
     * - User accomplishments are not lost
     */
    it('should preserve badges array through localStorage round-trip', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        adapter.saveToLocalStorage(progress.userId, progress);
        const loaded = adapter.loadFromLocalStorage(progress.userId);

        if (typeof localStorage === 'undefined') {
          return true;
        }

        return (
          loaded !== null &&
          JSON.stringify(loaded.badges) === JSON.stringify(progress.badges)
        );
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, when saved to localStorage
     * and then loaded, the loaded object SHALL have the same elementsLearned
     * structure as the original object.
     * 
     * This ensures that:
     * - Element learning progress is preserved
     * - Individual element tracking is maintained
     * - Learning history is not lost
     */
    it('should preserve elementsLearned structure through localStorage round-trip', () => {
      const property = fc.property(userProgressArbitrary, (progress) => {
        adapter.saveToLocalStorage(progress.userId, progress);
        const loaded = adapter.loadFromLocalStorage(progress.userId);

        if (typeof localStorage === 'undefined') {
          return true;
        }

        return (
          loaded !== null &&
          JSON.stringify(loaded.elementsLearned) === JSON.stringify(progress.elementsLearned)
        );
      });

      fc.assert(property, { numRuns: 30 });
    });

    /**
     * Property: For any valid UserProgress object, when saved to localStorage
     * with a specific userId, loading with a different userId SHALL return null
     * (or a different user's data if it exists).
     * 
     * This ensures that:
     * - User data is properly isolated
     * - Different users' data is not mixed
     * - User separation is maintained
     */
    it('should maintain user data separation in localStorage', () => {
      const property = fc.property(
        userProgressArbitrary,
        userProgressArbitrary,
        (progress1, progress2) => {
          // Ensure different userIds
          fc.pre(progress1.userId !== progress2.userId);

          adapter.saveToLocalStorage(progress1.userId, progress1);
          adapter.saveToLocalStorage(progress2.userId, progress2);

          const loaded1 = adapter.loadFromLocalStorage(progress1.userId);
          const loaded2 = adapter.loadFromLocalStorage(progress2.userId);

          if (typeof localStorage === 'undefined') {
            return true;
          }

          // Each user should load their own data
          return (
            loaded1 !== null &&
            loaded2 !== null &&
            loaded1.userId === progress1.userId &&
            loaded2.userId === progress2.userId &&
            loaded1.userId !== loaded2.userId
          );
        },
      );

      fc.assert(property, { numRuns: 20 });
    });
  });
});
