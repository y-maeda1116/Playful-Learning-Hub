/**
 * Difficulty Adjustment System for Element Symbol Puzzle
 *
 * Manages per-user difficulty levels and provides accuracy-based difficulty scaling.
 * Tracks difficulty progression and adjusts game difficulty based on user performance.
 */
/**
 * Represents a user's difficulty level and progression
 */
interface UserDifficultyLevel {
    userId: string;
    currentDifficulty: 'easy' | 'medium' | 'hard';
    difficultyScore: number;
    lastAdjustmentDate: number;
    adjustmentCount: number;
}
/**
 * DifficultyAdjustmentSystem class manages per-user difficulty levels
 */
export declare class DifficultyAdjustmentSystem {
    private userDifficultyLevels;
    /**
     * Initialize or get user difficulty level
     * @param userId - The user ID
     * @returns The UserDifficultyLevel object
     */
    private initializeUserDifficulty;
    /**
     * Adjust difficulty based on user accuracy
     * - Increases difficulty when accuracy >= 80%
     * - Decreases difficulty when accuracy < 50%
     * - Maintains difficulty when accuracy is between 50% and 80%
     * @param userId - The user ID
     * @param accuracy - The user's accuracy as a percentage (0-100)
     * @returns The new difficulty level
     * @throws Error if userId is invalid or accuracy is out of range
     */
    adjustDifficulty(userId: string, accuracy: number): 'easy' | 'medium' | 'hard';
    /**
     * Get the current difficulty level for a user
     * @param userId - The user ID
     * @returns The current difficulty level
     * @throws Error if userId is invalid
     */
    getCurrentDifficulty(userId: string): 'easy' | 'medium' | 'hard';
    /**
     * Get the difficulty progression data for a user
     * @param userId - The user ID
     * @returns The UserDifficultyLevel object
     * @throws Error if userId is invalid
     */
    getDifficultyProgression(userId: string): UserDifficultyLevel;
    /**
     * Set the difficulty level for a user (for testing or manual override)
     * @param userId - The user ID
     * @param difficulty - The difficulty level to set
     * @throws Error if userId is invalid or difficulty is invalid
     */
    setDifficulty(userId: string, difficulty: 'easy' | 'medium' | 'hard'): void;
    /**
     * Save difficulty progression to local storage
     * @param userId - The user ID
     * @throws Error if userId is invalid
     */
    saveToLocalStorage(userId: string): void;
    /**
     * Load difficulty progression from local storage
     * @param userId - The user ID
     * @returns The loaded UserDifficultyLevel object
     * @throws Error if userId is invalid
     */
    loadFromLocalStorage(userId: string): UserDifficultyLevel;
    /**
     * Clear all difficulty data (for testing purposes)
     */
    clearAllDifficulty(): void;
    /**
     * Get all users' difficulty levels (for testing purposes)
     * @returns Map of all user difficulty levels
     */
    getAllDifficulty(): Map<string, UserDifficultyLevel>;
}
export {};
