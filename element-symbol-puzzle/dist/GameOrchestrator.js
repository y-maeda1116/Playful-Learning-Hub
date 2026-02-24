"use strict";
/**
 * GameOrchestrator - Coordinates all game components and manages game flow
 *
 * Orchestrates interactions between GameEngine, ProgressTrackingSystem, RewardSystem,
 * AudioSystem, and UI components to provide a complete game experience.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameOrchestrator = void 0;
const GameEngine_1 = require("./GameEngine");
const ProgressTrackingSystem_1 = require("./ProgressTrackingSystem");
const RewardSystem_1 = require("./RewardSystem");
const AudioSystem_1 = require("./AudioSystem");
const PeriodicTableManager_1 = require("./PeriodicTableManager");
/**
 * Orchestrates the complete game flow
 */
class GameOrchestrator {
    constructor(gameEngine, progressTracking, rewardSystem, audioSystem, periodicTableManager) {
        this.currentSessionId = null;
        this.currentUserId = 'default-user';
        this.eventListeners = [];
        this.gameEngine = gameEngine || new GameEngine_1.GameEngine();
        this.progressTracking = progressTracking || new ProgressTrackingSystem_1.ProgressTrackingSystem();
        this.rewardSystem = rewardSystem || new RewardSystem_1.RewardSystem(this.progressTracking);
        this.audioSystem = audioSystem || new AudioSystem_1.AudioSystem();
        this.periodicTableManager = periodicTableManager || new PeriodicTableManager_1.PeriodicTableManager();
    }
    /**
     * Register a callback for game events
     *
     * @param callback - Function to call when game events occur
     */
    onGameEvent(callback) {
        this.eventListeners.push(callback);
    }
    /**
     * Emit a game event to all registered listeners
     *
     * @param event - The game event to emit
     */
    emitEvent(event) {
        this.eventListeners.forEach((callback) => {
            try {
                callback(event);
            }
            catch (error) {
                console.error('Error in game event listener:', error);
            }
        });
    }
    /**
     * Start a new game session
     *
     * @param gameType - Type of game to start
     * @param gradeLevel - Grade level for the game
     * @param userId - Optional user ID (defaults to 'default-user')
     * @returns The started game session
     */
    startGameSession(gameType, gradeLevel, userId) {
        this.currentUserId = userId || 'default-user';
        const session = this.gameEngine.startSession(gameType, gradeLevel, this.currentUserId);
        this.currentSessionId = session.sessionId;
        this.emitEvent({
            type: 'sessionStarted',
            data: { session },
        });
        return session;
    }
    /**
     * Display the next question and play audio
     *
     * @returns The next question element, or null if game is complete
     */
    async displayNextQuestion() {
        if (!this.currentSessionId) {
            throw new Error('No active game session');
        }
        const session = this.gameEngine.getSession(this.currentSessionId);
        const nextQuestion = this.gameEngine.getNextQuestion(this.currentSessionId);
        if (!nextQuestion) {
            return null;
        }
        // Play element audio
        await this.gameEngine.playElementAudio(nextQuestion);
        this.emitEvent({
            type: 'questionDisplayed',
            data: { question: nextQuestion, sessionProgress: session.currentIndex + 1 },
        });
        return nextQuestion;
    }
    /**
     * Submit an answer and handle feedback
     *
     * @param userAnswer - The user's answer
     * @returns Object containing answer result and feedback
     */
    async submitAnswer(userAnswer) {
        if (!this.currentSessionId) {
            throw new Error('No active game session');
        }
        const answer = this.gameEngine.submitAnswer(this.currentSessionId, userAnswer);
        // Play audio feedback
        if (answer.correct) {
            await this.gameEngine.playCorrectFeedbackAudio();
        }
        else {
            await this.gameEngine.playIncorrectFeedbackAudio();
        }
        const session = this.gameEngine.getSession(this.currentSessionId);
        const nextQuestion = this.gameEngine.getNextQuestion(this.currentSessionId);
        let feedback = '';
        let additionalInfo = '';
        if (answer.correct) {
            feedback = `正解です！${nextQuestion ? '次の問題に進みます。' : 'ゲーム完了です！'}`;
            additionalInfo = `${nextQuestion?.name || ''}`;
        }
        else {
            feedback = `不正解です。正しい答えは「${session.elements[session.currentIndex - 1]?.name}」です。`;
            additionalInfo = `原子番号: ${session.elements[session.currentIndex - 1]?.atomicNumber}`;
        }
        this.emitEvent({
            type: 'answerSubmitted',
            data: { answer, feedback, isCorrect: answer.correct },
        });
        this.emitEvent({
            type: 'feedbackDisplayed',
            data: { feedback, additionalInfo, isCorrect: answer.correct },
        });
        return { answer, isCorrect: answer.correct, feedback, additionalInfo };
    }
    /**
     * End the current game session and process results
     *
     * @returns Object containing session results and any earned badges
     */
    async endGameSession() {
        if (!this.currentSessionId) {
            throw new Error('No active game session');
        }
        const session = this.gameEngine.getSession(this.currentSessionId);
        const score = this.gameEngine.calculateScore(this.currentSessionId);
        const accuracy = this.gameEngine.calculateAccuracy(this.currentSessionId);
        // End the session
        this.gameEngine.endSession(this.currentSessionId);
        // Update progress
        this.progressTracking.updateProgress(this.currentUserId, session);
        // Adjust difficulty for next session
        this.gameEngine.adjustDifficultyAfterSession(this.currentSessionId);
        // Check for earned badges
        const earnedBadgeIds = this.rewardSystem.checkBadgeCriteria(this.currentUserId, session);
        // Award badges and play reward audio
        const earnedBadges = [];
        for (const badgeId of earnedBadgeIds) {
            this.rewardSystem.awardBadge(this.currentUserId, badgeId);
            await this.gameEngine.playRewardNotificationAudio();
            const badge = this.rewardSystem.getUnlockedBadges(this.currentUserId).find((b) => b.id === badgeId);
            if (badge) {
                earnedBadges.push(badge);
                this.emitEvent({
                    type: 'badgeEarned',
                    data: { badge },
                });
            }
        }
        this.emitEvent({
            type: 'sessionEnded',
            data: { score, accuracy, badges: earnedBadges },
        });
        this.currentSessionId = null;
        return { score, accuracy, badges: earnedBadges };
    }
    /**
     * Get current user progress
     *
     * @returns The user's progress data
     */
    getUserProgress() {
        return this.progressTracking.getProgress(this.currentUserId);
    }
    /**
     * Get user's unlocked badges
     *
     * @returns Array of unlocked badge IDs
     */
    getUnlockedBadges() {
        const progress = this.progressTracking.getProgress(this.currentUserId);
        return progress.badges;
    }
    /**
     * Get user's current streak days
     *
     * @returns Number of consecutive days with completed sessions
     */
    getStreakDays() {
        const progress = this.progressTracking.getProgress(this.currentUserId);
        return progress.streakDays;
    }
    /**
     * Get the current game session
     *
     * @returns The current game session, or null if no session is active
     */
    getCurrentSession() {
        if (!this.currentSessionId) {
            return null;
        }
        return this.gameEngine.getSession(this.currentSessionId);
    }
    /**
     * Set the current user ID
     *
     * @param userId - The user ID to set
     */
    setCurrentUser(userId) {
        this.currentUserId = userId;
    }
    /**
     * Get the current user ID
     *
     * @returns The current user ID
     */
    getCurrentUser() {
        return this.currentUserId;
    }
    /**
     * Get the periodic table manager
     *
     * @returns The PeriodicTableManager instance
     */
    getPeriodicTableManager() {
        return this.periodicTableManager;
    }
    /**
     * Get the game engine
     *
     * @returns The GameEngine instance
     */
    getGameEngine() {
        return this.gameEngine;
    }
    /**
     * Get the progress tracking system
     *
     * @returns The ProgressTrackingSystem instance
     */
    getProgressTracking() {
        return this.progressTracking;
    }
    /**
     * Get the reward system
     *
     * @returns The RewardSystem instance
     */
    getRewardSystem() {
        return this.rewardSystem;
    }
    /**
     * Get the audio system
     *
     * @returns The AudioSystem instance
     */
    getAudioSystem() {
        return this.audioSystem;
    }
}
exports.GameOrchestrator = GameOrchestrator;
