/**
 * Reward System for Element Symbol Puzzle
 *
 * Manages badge awards, streak tracking, and achievement unlocking.
 * Integrates with ProgressTrackingSystem to check badge criteria and award badges.
 */
import { Badge, GameSession, Achievement } from './types';
import { ProgressTrackingSystem } from './ProgressTrackingSystem';
/**
 * RewardSystem class manages badges, achievements, and rewards
 */
export declare class RewardSystem {
    private progressTrackingSystem;
    private achievements;
    /**
     * Initialize RewardSystem with a ProgressTrackingSystem instance
     * @param progressTrackingSystem - The ProgressTrackingSystem instance to use
     */
    constructor(progressTrackingSystem: ProgressTrackingSystem);
    /**
     * Check if a user meets the criteria for a specific badge
     * @param userId - The user ID
     * @param badge - The badge to check criteria for
     * @returns true if the user meets the badge criteria, false otherwise
     * @throws Error if user not found
     */
    private checkBadgeCriteriaForBadge;
    /**
     * Check all badge criteria for a user after a game session
     * Returns array of badge IDs that the user newly unlocked
     * @param userId - The user ID
     * @param sessionData - The completed game session
     * @returns Array of newly unlocked badge IDs
     * @throws Error if user not found
     */
    checkBadgeCriteria(userId: string, sessionData: GameSession): string[];
    /**
     * Award a badge to a user
     * @param userId - The user ID
     * @param badgeId - The badge ID to award
     * @throws Error if user not found or badge not found
     */
    awardBadge(userId: string, badgeId: string): void;
    /**
     * Get all unlocked badges for a user
     * @param userId - The user ID
     * @returns Array of Badge objects that the user has unlocked
     * @throws Error if user not found
     */
    getUnlockedBadges(userId: string): Badge[];
    /**
     * Get the number of consecutive learning days for a user
     * @param userId - The user ID
     * @returns The number of consecutive learning days
     * @throws Error if user not found
     */
    getStreakDays(userId: string): number;
    /**
     * Get all achievements for a user
     * @param userId - The user ID
     * @returns Array of Achievement objects for the user
     */
    getAchievements(userId: string): Achievement[];
    /**
     * Clear all achievements (for testing purposes)
     */
    clearAllAchievements(): void;
}
