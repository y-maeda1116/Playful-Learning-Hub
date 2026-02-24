/**
 * Storage Adapter for Element Symbol Puzzle
 * 
 * Handles serialization, deserialization, and persistence of user progress data
 * to local storage. Provides a clean interface for storage operations with
 * proper error handling and data validation.
 */

import { UserProgress } from './types';

/**
 * StorageAdapter class manages data persistence to local storage
 * Handles serialization/deserialization and data integrity validation
 */
export class StorageAdapter {
  private readonly storageKeyPrefix = 'element-puzzle-progress-';

  /**
   * Serialize UserProgress to JSON string
   * @param progress - The UserProgress object to serialize
   * @returns JSON string representation of the progress
   * @throws Error if progress is invalid or serialization fails
   */
  serializeProgress(progress: UserProgress): string {
    if (!progress || !progress.userId) {
      throw new Error('Invalid progress: must contain userId');
    }

    if (!progress.elementsLearned || typeof progress.elementsLearned !== 'object') {
      throw new Error('Invalid progress: elementsLearned must be an object');
    }

    try {
      return JSON.stringify(progress);
    } catch (error) {
      throw new Error(`Failed to serialize progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deserialize JSON string to UserProgress object
   * @param jsonString - JSON string to deserialize
   * @returns Deserialized UserProgress object
   * @throws Error if JSON is invalid or data is corrupted
   */
  deserializeProgress(jsonString: string): UserProgress {
    if (!jsonString || typeof jsonString !== 'string') {
      throw new Error('Invalid JSON string: must be a non-empty string');
    }

    try {
      const progress = JSON.parse(jsonString) as UserProgress;

      // Validate deserialized data
      this.validateProgressData(progress);

      return progress;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse JSON: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate UserProgress data integrity
   * @param progress - The UserProgress object to validate
   * @throws Error if data is invalid or corrupted
   */
  private validateProgressData(progress: UserProgress): void {
    if (!progress.userId || typeof progress.userId !== 'string') {
      throw new Error('Corrupted progress data: invalid userId');
    }

    if (!progress.elementsLearned || typeof progress.elementsLearned !== 'object') {
      throw new Error('Corrupted progress data: invalid elementsLearned');
    }

    if (typeof progress.gradeLevel !== 'number' || ![3, 4, 5, 6].includes(progress.gradeLevel)) {
      throw new Error('Corrupted progress data: invalid gradeLevel');
    }

    if (typeof progress.sessionCount !== 'number' || progress.sessionCount < 0) {
      throw new Error('Corrupted progress data: invalid sessionCount');
    }

    if (typeof progress.averageAccuracy !== 'number' || progress.averageAccuracy < 0 || progress.averageAccuracy > 100) {
      throw new Error('Corrupted progress data: invalid averageAccuracy');
    }

    if (!Array.isArray(progress.badges)) {
      throw new Error('Corrupted progress data: badges must be an array');
    }

    if (typeof progress.streakDays !== 'number' || progress.streakDays < 0) {
      throw new Error('Corrupted progress data: invalid streakDays');
    }
  }

  /**
   * Save progress to local storage
   * @param userId - The user ID
   * @param progress - The UserProgress object to save
   * @throws Error if userId is invalid, progress is invalid, or storage operation fails
   */
  saveToLocalStorage(userId: string, progress: UserProgress): void {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId: must be a non-empty string');
    }

    if (!progress) {
      throw new Error('Invalid progress: must not be null or undefined');
    }

    try {
      const storageKey = this.getStorageKey(userId);
      const serialized = this.serializeProgress(progress);
      
      if (typeof localStorage === 'undefined') {
        // In Node.js test environment, localStorage is not available
        // Silently skip saving
        return;
      }

      localStorage.setItem(storageKey, serialized);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        throw error;
      }
      // Handle storage quota exceeded or other storage errors
      throw new Error(`Failed to save progress to localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load progress from local storage
   * @param userId - The user ID
   * @returns The loaded UserProgress object, or null if not found
   * @throws Error if userId is invalid or data is corrupted
   */
  loadFromLocalStorage(userId: string): UserProgress | null {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId: must be a non-empty string');
    }

    try {
      if (typeof localStorage === 'undefined') {
        // In Node.js test environment, localStorage is not available
        return null;
      }

      const storageKey = this.getStorageKey(userId);
      const storedData = localStorage.getItem(storageKey);

      if (!storedData) {
        return null;
      }

      return this.deserializeProgress(storedData);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Corrupted') || error.message.includes('Failed to parse JSON'))) {
        throw new Error('Corrupted progress data');
      }
      // For other errors, return null to allow fallback to new progress
      return null;
    }
  }

  /**
   * Delete progress from local storage
   * @param userId - The user ID
   * @throws Error if userId is invalid
   */
  deleteFromLocalStorage(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId: must be a non-empty string');
    }

    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      const storageKey = this.getStorageKey(userId);
      localStorage.removeItem(storageKey);
    } catch (error) {
      throw new Error(`Failed to delete progress from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if progress exists in local storage
   * @param userId - The user ID
   * @returns True if progress exists, false otherwise
   * @throws Error if userId is invalid
   */
  existsInLocalStorage(userId: string): boolean {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId: must be a non-empty string');
    }

    try {
      if (typeof localStorage === 'undefined') {
        return false;
      }

      const storageKey = this.getStorageKey(userId);
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the storage key for a user
   * @param userId - The user ID
   * @returns The formatted storage key
   */
  private getStorageKey(userId: string): string {
    return `${this.storageKeyPrefix}${userId}`;
  }

  /**
   * Clear all progress data from local storage (for testing purposes)
   */
  clearAllStorage(): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKeyPrefix)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }
}
