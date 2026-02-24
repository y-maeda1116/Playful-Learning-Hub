/**
 * GameOrchestrator - Coordinates all game components and manages game flow
 *
 * Orchestrates interactions between GameEngine, ProgressTrackingSystem, RewardSystem,
 * AudioSystem, and UI components to provide a complete game experience.
 */
import { GameEngine } from './GameEngine';
import { ProgressTrackingSystem } from './ProgressTrackingSystem';
import { RewardSystem } from './RewardSystem';
import { AudioSystem } from './AudioSystem';
import { PeriodicTableManager } from './PeriodicTableManager';
import { GameSession, Answer, UserProgress, Badge } from './types';
/**
 * Callback for game events
 */
export type GameEventCallback = (event: GameEvent) => void;
/**
 * Game event types
 */
export interface GameEvent {
    type: 'sessionStarted' | 'questionDisplayed' | 'answerSubmitted' | 'feedbackDisplayed' | 'badgeEarned' | 'sessionEnded' | 'error';
    data: any;
}
/**
 * Orchestrates the complete game flow
 */
export declare class GameOrchestrator {
    private gameEngine;
    private progressTracking;
    private rewardSystem;
    private audioSystem;
    private periodicTableManager;
    private currentSessionId;
    private currentUserId;
    private eventListeners;
    constructor(gameEngine?: GameEngine, progressTracking?: ProgressTrackingSystem, rewardSystem?: RewardSystem, audioSystem?: AudioSystem, periodicTableManager?: PeriodicTableManager);
    /**
     * Register a callback for game events
     *
     * @param callback - Function to call when game events occur
     */
    onGameEvent(callback: GameEventCallback): void;
    /**
     * Emit a game event to all registered listeners
     *
     * @param event - The game event to emit
     */
    private emitEvent;
    /**
     * Start a new game session
     *
     * @param gameType - Type of game to start
     * @param gradeLevel - Grade level for the game
     * @param userId - Optional user ID (defaults to 'default-user')
     * @returns The started game session
     */
    startGameSession(gameType: 'matching' | 'quiz' | 'chemicalFormula' | 'periodicTableJigsaw', gradeLevel: 3 | 4 | 5 | 6, userId?: string): GameSession;
    /**
     * Display the next question and play audio
     *
     * @returns The next question element, or null if game is complete
     */
    displayNextQuestion(): Promise<any>;
    /**
     * Submit an answer and handle feedback
     *
     * @param userAnswer - The user's answer
     * @returns Object containing answer result and feedback
     */
    submitAnswer(userAnswer: string): Promise<{
        answer: Answer;
        isCorrect: boolean;
        feedback: string;
        additionalInfo?: string;
    }>;
    /**
     * End the current game session and process results
     *
     * @returns Object containing session results and any earned badges
     */
    endGameSession(): Promise<{
        score: number;
        accuracy: number;
        badges: Badge[];
    }>;
    /**
     * Get current user progress
     *
     * @returns The user's progress data
     */
    getUserProgress(): UserProgress;
    /**
     * Get user's unlocked badges
     *
     * @returns Array of unlocked badge IDs
     */
    getUnlockedBadges(): string[];
    /**
     * Get user's current streak days
     *
     * @returns Number of consecutive days with completed sessions
     */
    getStreakDays(): number;
    /**
     * Get the current game session
     *
     * @returns The current game session, or null if no session is active
     */
    getCurrentSession(): GameSession | null;
    /**
     * Set the current user ID
     *
     * @param userId - The user ID to set
     */
    setCurrentUser(userId: string): void;
    /**
     * Get the current user ID
     *
     * @returns The current user ID
     */
    getCurrentUser(): string;
    /**
     * Get the periodic table manager
     *
     * @returns The PeriodicTableManager instance
     */
    getPeriodicTableManager(): PeriodicTableManager;
    /**
     * Get the game engine
     *
     * @returns The GameEngine instance
     */
    getGameEngine(): GameEngine;
    /**
     * Get the progress tracking system
     *
     * @returns The ProgressTrackingSystem instance
     */
    getProgressTracking(): ProgressTrackingSystem;
    /**
     * Get the reward system
     *
     * @returns The RewardSystem instance
     */
    getRewardSystem(): RewardSystem;
    /**
     * Get the audio system
     *
     * @returns The AudioSystem instance
     */
    getAudioSystem(): AudioSystem;
}
