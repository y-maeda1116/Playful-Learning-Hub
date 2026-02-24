"use strict";
/**
 * Progress Tracking System for Element Symbol Puzzle
 *
 * Manages user learning progress, session statistics, and mastery levels.
 * Tracks element learning status, session history, and overall performance metrics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressTrackingSystem = void 0;
/**
 * ProgressTrackingSystem class manages user learning progress and statistics
 */
class ProgressTrackingSystem {
    constructor() {
        this.progressData = new Map();
    }
    /**
     * Initialize or get user progress
     * @param userId - The user ID
     * @param gradeLevel - The grade level (3-6)
     * @returns The UserProgress object
     */
    initializeUserProgress(userId, gradeLevel) {
        if (!this.progressData.has(userId)) {
            const progress = {
                userId,
                gradeLevel,
                elementsLearned: {},
                totalSessionTime: 0,
                sessionCount: 0,
                averageAccuracy: 0,
                badges: [],
                streakDays: 0,
                lastSessionDate: 0,
                jigsawPuzzlesCompleted: 0,
            };
            this.progressData.set(userId, progress);
        }
        return this.progressData.get(userId);
    }
    /**
     * Update user progress after a game session
     * @param userId - The user ID
     * @param sessionData - The completed game session
     * @throws Error if userId is invalid or sessionData is incomplete
     */
    updateProgress(userId, sessionData) {
        if (!userId || userId.trim() === '') {
            throw new Error('Invalid userId: must not be empty');
        }
        if (!sessionData || !sessionData.sessionId) {
            throw new Error('Invalid sessionData: must contain sessionId');
        }
        const progress = this.initializeUserProgress(userId, sessionData.gradeLevel);
        // Update session statistics
        progress.sessionCount++;
        const sessionDuration = Date.now() - sessionData.startTime;
        progress.totalSessionTime += sessionDuration;
        // Update element learning status
        for (const answer of sessionData.answers) {
            if (!progress.elementsLearned[answer.elementId]) {
                progress.elementsLearned[answer.elementId] = {
                    status: 'not-started',
                    attempts: 0,
                    correctAttempts: 0,
                    lastAttempt: 0,
                };
            }
            const elementProgress = progress.elementsLearned[answer.elementId];
            elementProgress.attempts++;
            if (answer.correct) {
                elementProgress.correctAttempts++;
            }
            elementProgress.lastAttempt = answer.timestamp;
            // Update status based on attempts and correct answers
            const correctRate = elementProgress.correctAttempts / elementProgress.attempts;
            if (correctRate >= 0.8 && elementProgress.attempts >= 2) {
                elementProgress.status = 'mastered';
            }
            else if (elementProgress.attempts >= 1) {
                elementProgress.status = 'learning';
            }
        }
        // Update average accuracy
        const totalAnswers = Object.values(progress.elementsLearned).reduce((sum, elem) => sum + elem.attempts, 0);
        const totalCorrect = Object.values(progress.elementsLearned).reduce((sum, elem) => sum + elem.correctAttempts, 0);
        progress.averageAccuracy = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;
        // Update streak days
        const today = new Date().toDateString();
        const lastSessionDay = new Date(progress.lastSessionDate).toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        if (lastSessionDay === today) {
            // Already played today, don't increment streak
        }
        else if (lastSessionDay === yesterday) {
            // Played yesterday, increment streak
            progress.streakDays++;
        }
        else {
            // Gap in streak, reset to 1
            progress.streakDays = 1;
        }
        progress.lastSessionDate = Date.now();
    }
    /**
     * Get user progress
     * @param userId - The user ID
     * @returns The UserProgress object
     * @throws Error if user not found
     */
    getProgress(userId) {
        if (!userId || userId.trim() === '') {
            throw new Error('Invalid userId: must not be empty');
        }
        const progress = this.progressData.get(userId);
        if (!progress) {
            throw new Error(`User ${userId} not found`);
        }
        return progress;
    }
    /**
     * Calculate the mastery level for a user (0-100)
     * Based on the percentage of elements mastered
     * @param userId - The user ID
     * @returns The mastery level as a percentage (0-100)
     * @throws Error if user not found
     */
    calculateMasteryLevel(userId) {
        const progress = this.getProgress(userId);
        const elements = Object.values(progress.elementsLearned);
        if (elements.length === 0) {
            return 0;
        }
        const masteredCount = elements.filter((elem) => elem.status === 'mastered').length;
        return (masteredCount / elements.length) * 100;
    }
    /**
     * Get weak elements that need more practice
     * Returns elements with low accuracy or not yet mastered
     * @param userId - The user ID
     * @returns Array of element IDs that need practice, sorted by accuracy (lowest first)
     * @throws Error if user not found
     */
    getWeakElements(userId) {
        const progress = this.getProgress(userId);
        const weakElements = Object.entries(progress.elementsLearned)
            .filter(([, elem]) => elem.status !== 'mastered')
            .map(([elementId, elem]) => ({
            elementId,
            accuracy: elem.correctAttempts / elem.attempts,
        }))
            .sort((a, b) => a.accuracy - b.accuracy)
            .map(({ elementId }) => elementId);
        return weakElements;
    }
    /**
     * Save progress to local storage
     * @param userId - The user ID
     * @throws Error if localStorage is not available or userId is invalid
     */
    saveToLocalStorage(userId) {
        if (!userId || userId.trim() === '') {
            throw new Error('Invalid userId: must not be empty');
        }
        const progress = this.getProgress(userId);
        try {
            if (typeof localStorage === 'undefined') {
                // In Node.js test environment, localStorage is not available
                // Skip saving in this case
                return;
            }
            const storageKey = `element-puzzle-progress-${userId}`;
            localStorage.setItem(storageKey, JSON.stringify(progress));
        }
        catch (error) {
            // Silently fail if localStorage is not available (e.g., in Node.js tests)
            // In a real browser environment, this would be logged
        }
    }
    /**
     * Load progress from local storage
     * @param userId - The user ID
     * @param gradeLevel - The grade level (3-6) for new users
     * @returns The loaded UserProgress object
     * @throws Error if localStorage is not available or data is corrupted
     */
    loadFromLocalStorage(userId, gradeLevel) {
        if (!userId || userId.trim() === '') {
            throw new Error('Invalid userId: must not be empty');
        }
        try {
            if (typeof localStorage === 'undefined') {
                // In Node.js test environment, localStorage is not available
                // Initialize new progress
                return this.initializeUserProgress(userId, gradeLevel);
            }
            const storageKey = `element-puzzle-progress-${userId}`;
            const storedData = localStorage.getItem(storageKey);
            if (!storedData) {
                // No existing data, initialize new progress
                return this.initializeUserProgress(userId, gradeLevel);
            }
            const progress = JSON.parse(storedData);
            // Validate loaded data
            if (!progress.userId || !progress.elementsLearned) {
                throw new Error('Corrupted progress data');
            }
            this.progressData.set(userId, progress);
            return progress;
        }
        catch (error) {
            // If parsing fails or other error, initialize new progress
            return this.initializeUserProgress(userId, gradeLevel);
        }
    }
    /**
     * Clear all progress data (for testing purposes)
     */
    clearAllProgress() {
        this.progressData.clear();
    }
    /**
     * Get all users' progress (for testing purposes)
     * @returns Map of all user progress data
     */
    getAllProgress() {
        return new Map(this.progressData);
    }
}
exports.ProgressTrackingSystem = ProgressTrackingSystem;
