/**
 * Progress Tracking System for Element Symbol Puzzle
 *
 * Manages user learning progress, session statistics, and mastery levels.
 * Tracks element learning status, session history, and overall performance metrics.
 */
import { UserProgress, GameSession } from './types';
/**
 * ProgressTrackingSystem class manages user learning progress and statistics
 */
export declare class ProgressTrackingSystem {
    private progressData;
    /**
     * Initialize or get user progress
     * @param userId - The user ID
     * @param gradeLevel - The grade level (3-6)
     * @returns The UserProgress object
     */
    private initializeUserProgress;
    /**
     * Update user progress after a game session
     * @param userId - The user ID
     * @param sessionData - The completed game session
     * @throws Error if userId is invalid or sessionData is incomplete
     */
    updateProgress(userId: string, sessionData: GameSession): void;
    /**
     * Get user progress
     * @param userId - The user ID
     * @returns The UserProgress object
     * @throws Error if user not found
     */
    getProgress(userId: string): UserProgress;
    /**
     * Calculate the mastery level for a user (0-100)
     * Based on the percentage of elements mastered
     * @param userId - The user ID
     * @returns The mastery level as a percentage (0-100)
     * @throws Error if user not found
     */
    calculateMasteryLevel(userId: string): number;
    /**
     * Get weak elements that need more practice
     * Returns elements with low accuracy or not yet mastered
     * @param userId - The user ID
     * @returns Array of element IDs that need practice, sorted by accuracy (lowest first)
     * @throws Error if user not found
     */
    getWeakElements(userId: string): string[];
    /**
     * Save progress to local storage
     * @param userId - The user ID
     * @throws Error if localStorage is not available or userId is invalid
     */
    saveToLocalStorage(userId: string): void;
    /**
     * Load progress from local storage
     * @param userId - The user ID
     * @param gradeLevel - The grade level (3-6) for new users
     * @returns The loaded UserProgress object
     * @throws Error if localStorage is not available or data is corrupted
     */
    loadFromLocalStorage(userId: string, gradeLevel: 3 | 4 | 5 | 6): UserProgress;
    /**
     * Clear all progress data (for testing purposes)
     */
    clearAllProgress(): void;
    /**
     * Get all users' progress (for testing purposes)
     * @returns Map of all user progress data
     */
    getAllProgress(): Map<string, UserProgress>;
}
