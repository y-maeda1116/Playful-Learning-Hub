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
export declare class StorageAdapter {
    private readonly storageKeyPrefix;
    /**
     * Serialize UserProgress to JSON string
     * @param progress - The UserProgress object to serialize
     * @returns JSON string representation of the progress
     * @throws Error if progress is invalid or serialization fails
     */
    serializeProgress(progress: UserProgress): string;
    /**
     * Deserialize JSON string to UserProgress object
     * @param jsonString - JSON string to deserialize
     * @returns Deserialized UserProgress object
     * @throws Error if JSON is invalid or data is corrupted
     */
    deserializeProgress(jsonString: string): UserProgress;
    /**
     * Validate UserProgress data integrity
     * @param progress - The UserProgress object to validate
     * @throws Error if data is invalid or corrupted
     */
    private validateProgressData;
    /**
     * Save progress to local storage
     * @param userId - The user ID
     * @param progress - The UserProgress object to save
     * @throws Error if userId is invalid, progress is invalid, or storage operation fails
     */
    saveToLocalStorage(userId: string, progress: UserProgress): void;
    /**
     * Load progress from local storage
     * @param userId - The user ID
     * @returns The loaded UserProgress object, or null if not found
     * @throws Error if userId is invalid or data is corrupted
     */
    loadFromLocalStorage(userId: string): UserProgress | null;
    /**
     * Delete progress from local storage
     * @param userId - The user ID
     * @throws Error if userId is invalid
     */
    deleteFromLocalStorage(userId: string): void;
    /**
     * Check if progress exists in local storage
     * @param userId - The user ID
     * @returns True if progress exists, false otherwise
     * @throws Error if userId is invalid
     */
    existsInLocalStorage(userId: string): boolean;
    /**
     * Get the storage key for a user
     * @param userId - The user ID
     * @returns The formatted storage key
     */
    private getStorageKey;
    /**
     * Clear all progress data from local storage (for testing purposes)
     */
    clearAllStorage(): void;
}
