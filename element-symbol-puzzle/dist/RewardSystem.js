"use strict";
/**
 * Reward System for Element Symbol Puzzle
 *
 * Manages badge awards, streak tracking, and achievement unlocking.
 * Integrates with ProgressTrackingSystem to check badge criteria and award badges.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardSystem = void 0;
const badges_1 = require("./badges");
/**
 * RewardSystem class manages badges, achievements, and rewards
 */
class RewardSystem {
    /**
     * Initialize RewardSystem with a ProgressTrackingSystem instance
     * @param progressTrackingSystem - The ProgressTrackingSystem instance to use
     */
    constructor(progressTrackingSystem) {
        this.achievements = new Map();
        this.progressTrackingSystem = progressTrackingSystem;
    }
    /**
     * Check if a user meets the criteria for a specific badge
     * @param userId - The user ID
     * @param badge - The badge to check criteria for
     * @returns true if the user meets the badge criteria, false otherwise
     * @throws Error if user not found
     */
    checkBadgeCriteriaForBadge(userId, badge) {
        const progress = this.progressTrackingSystem.getProgress(userId);
        switch (badge.criteria.type) {
            case 'elements-learned': {
                const masteredCount = Object.values(progress.elementsLearned).filter((elem) => elem.status === 'mastered').length;
                return masteredCount >= badge.criteria.threshold;
            }
            case 'accuracy': {
                return progress.averageAccuracy >= badge.criteria.threshold;
            }
            case 'streak': {
                return progress.streakDays >= badge.criteria.threshold;
            }
            case 'formula-mastery': {
                return progress.jigsawPuzzlesCompleted >= badge.criteria.threshold;
            }
            case 'jigsaw-completed': {
                return progress.jigsawPuzzlesCompleted >= badge.criteria.threshold;
            }
            default:
                return false;
        }
    }
    /**
     * Check all badge criteria for a user after a game session
     * Returns array of badge IDs that the user newly unlocked
     * @param userId - The user ID
     * @param sessionData - The completed game session
     * @returns Array of newly unlocked badge IDs
     * @throws Error if user not found
     */
    checkBadgeCriteria(userId, sessionData) {
        if (!userId || userId.trim() === '') {
            throw new Error('Invalid userId: must not be empty');
        }
        if (!sessionData || !sessionData.sessionId) {
            throw new Error('Invalid sessionData: must contain sessionId');
        }
        const progress = this.progressTrackingSystem.getProgress(userId);
        const newlyUnlockedBadges = [];
        // Check all badges to see which ones the user now qualifies for
        const allBadges = Object.values(badges_1.BADGES);
        for (const badge of allBadges) {
            // Skip if already unlocked
            if (progress.badges.includes(badge.id)) {
                continue;
            }
            // Check if user meets criteria
            if (this.checkBadgeCriteriaForBadge(userId, badge)) {
                newlyUnlockedBadges.push(badge.id);
            }
        }
        return newlyUnlockedBadges;
    }
    /**
     * Award a badge to a user
     * @param userId - The user ID
     * @param badgeId - The badge ID to award
     * @throws Error if user not found or badge not found
     */
    awardBadge(userId, badgeId) {
        if (!userId || userId.trim() === '') {
            throw new Error('Invalid userId: must not be empty');
        }
        if (!badgeId || badgeId.trim() === '') {
            throw new Error('Invalid badgeId: must not be empty');
        }
        const badge = (0, badges_1.getBadgeById)(badgeId);
        if (!badge) {
            throw new Error(`Badge ${badgeId} not found`);
        }
        const progress = this.progressTrackingSystem.getProgress(userId);
        // Check if badge already awarded
        if (progress.badges.includes(badgeId)) {
            return; // Already awarded, skip
        }
        // Award the badge
        progress.badges.push(badgeId);
        // Record achievement
        if (!this.achievements.has(userId)) {
            this.achievements.set(userId, []);
        }
        const achievement = {
            userId,
            badgeId,
            unlockedDate: Date.now(),
            displayNotification: true,
        };
        this.achievements.get(userId).push(achievement);
    }
    /**
     * Get all unlocked badges for a user
     * @param userId - The user ID
     * @returns Array of Badge objects that the user has unlocked
     * @throws Error if user not found
     */
    getUnlockedBadges(userId) {
        if (!userId || userId.trim() === '') {
            throw new Error('Invalid userId: must not be empty');
        }
        const progress = this.progressTrackingSystem.getProgress(userId);
        return progress.badges
            .map((badgeId) => (0, badges_1.getBadgeById)(badgeId))
            .filter((badge) => badge !== undefined);
    }
    /**
     * Get the number of consecutive learning days for a user
     * @param userId - The user ID
     * @returns The number of consecutive learning days
     * @throws Error if user not found
     */
    getStreakDays(userId) {
        if (!userId || userId.trim() === '') {
            throw new Error('Invalid userId: must not be empty');
        }
        const progress = this.progressTrackingSystem.getProgress(userId);
        return progress.streakDays;
    }
    /**
     * Get all achievements for a user
     * @param userId - The user ID
     * @returns Array of Achievement objects for the user
     */
    getAchievements(userId) {
        if (!userId || userId.trim() === '') {
            throw new Error('Invalid userId: must not be empty');
        }
        return this.achievements.get(userId) || [];
    }
    /**
     * Clear all achievements (for testing purposes)
     */
    clearAllAchievements() {
        this.achievements.clear();
    }
}
exports.RewardSystem = RewardSystem;
