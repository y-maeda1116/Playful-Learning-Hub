/**
 * Game Engine for Element Symbol Puzzle
 *
 * Manages game sessions, answer validation, and scoring for all game modes.
 * Supports matching, quiz, chemical formula, and periodic table jigsaw games.
 * Integrates with DifficultyAdjustmentSystem for dynamic difficulty scaling.
 */
import { Element, GameSession, Answer } from './types';
import { DifficultyAdjustmentSystem } from './DifficultyAdjustmentSystem';
import { AudioSystem } from './AudioSystem';
/**
 * GameEngine class manages game sessions and game logic
 */
export declare class GameEngine {
    private contentManager;
    private difficultySystem;
    private audioSystem;
    private sessions;
    private answerStartTimes;
    private sessionUserIds;
    constructor(difficultySystem?: DifficultyAdjustmentSystem, audioSystem?: AudioSystem);
    /**
     * Start a new game session with specified game type and grade level
     * Loads the user's current difficulty level from DifficultyAdjustmentSystem
     * @param gameType - The type of game ('matching', 'quiz', 'chemicalFormula', 'periodicTableJigsaw')
     * @param gradeLevel - The grade level (3-6)
     * @param userId - Optional user ID to load difficulty progression. If not provided, defaults to 'default-user'
     * @returns A new GameSession with difficulty set based on user's previous performance
     * @throws Error if gameType is invalid or gradeLevel is out of range
     */
    startSession(gameType: 'matching' | 'quiz' | 'chemicalFormula' | 'periodicTableJigsaw', gradeLevel: 3 | 4 | 5 | 6, userId?: string): GameSession;
    /**
     * Start a new matching game session (convenience method)
     * @param gradeLevel - The grade level (3-6)
     * @param userId - Optional user ID to load difficulty progression
     * @returns A new GameSession with gameType 'matching'
     */
    startMatchingSession(gradeLevel: 3 | 4 | 5 | 6, userId?: string): GameSession;
    /**
     * Start a new quiz game session (convenience method)
     * @param gradeLevel - The grade level (5 or 6 for quiz)
     * @param userId - Optional user ID to load difficulty progression
     * @returns A new GameSession with gameType 'quiz'
     */
    startQuizSession(gradeLevel: 5 | 6, userId?: string): GameSession;
    /**
     * Start tracking response time for the current question
     * Call this when a question is displayed to the user
     * @param sessionId - The session ID
     */
    startAnswerTimer(sessionId: string): void;
    /**
     * Submit an answer for the current question
     * Handles different game types appropriately:
     * - matching: userAnswer should be the element name
     * - quiz: userAnswer should be an element property (type, reactivity, state)
     * - chemicalFormula: userAnswer should be element symbols
     * @param sessionId - The session ID
     * @param userAnswer - The user's answer (format depends on game type)
     * @returns The Answer object with correctness information
     * @throws Error if session not found or game has ended
     */
    submitAnswer(sessionId: string, userAnswer: string): Answer;
    /**
     * Get the current session
     * @param sessionId - The session ID
     * @returns The GameSession
     */
    getSession(sessionId: string): GameSession;
    /**
     * Calculate the final score for a session
     * @param sessionId - The session ID
     * @returns The final score
     */
    calculateScore(sessionId: string): number;
    /**
     * Calculate the accuracy (正答率) for a session
     * @param sessionId - The session ID
     * @returns The accuracy as a percentage (0-100)
     */
    calculateAccuracy(sessionId: string): number;
    /**
     * Calculate the average response time for a session
     * @param sessionId - The session ID
     * @returns The average response time in milliseconds
     */
    calculateAverageResponseTime(sessionId: string): number;
    /**
     * End a game session
     * @param sessionId - The session ID
     */
    endSession(sessionId: string): void;
    /**
     * Adjust difficulty based on session accuracy and persist changes
     * Called after a session completes to update the user's difficulty level
     * - Increases difficulty when accuracy >= 80%
     * - Decreases difficulty when accuracy < 50%
     * - Maintains difficulty when accuracy is between 50% and 80%
     * @param sessionId - The session ID
     * @returns The new difficulty level
     * @throws Error if session not found
     */
    adjustDifficultyAfterSession(sessionId: string): 'easy' | 'medium' | 'hard';
    /**
     * Get the next question element
     * @param sessionId - The session ID
     * @returns The next Element to be answered
     */
    getNextQuestion(sessionId: string): Element | null;
    /**
     * Submit a quiz answer for the current question (convenience method)
     * For quiz games: userAnswer can be element type, reactivity, or other properties
     * @param sessionId - The session ID
     * @param userAnswer - The user's answer (element property value)
     * @returns The Answer object with correctness information
     * @throws Error if session is not a quiz session
     */
    submitQuizAnswer(sessionId: string, userAnswer: string): Answer;
    /**
     * Play audio for element pronunciation when element is selected
     * @param element - The element to play audio for
     * @returns A promise that resolves when audio playback completes or fails gracefully
     */
    playElementAudio(element: Element): Promise<void>;
    /**
     * Play audio feedback for correct answer
     * @returns A promise that resolves when audio playback completes or fails gracefully
     */
    playCorrectFeedbackAudio(): Promise<void>;
    /**
     * Play audio feedback for incorrect answer
     * @returns A promise that resolves when audio playback completes or fails gracefully
     */
    playIncorrectFeedbackAudio(): Promise<void>;
    /**
     * Play audio notification for reward/badge achievement
     * @returns A promise that resolves when audio playback completes or fails gracefully
     */
    playRewardNotificationAudio(): Promise<void>;
    /**
     * Get the audio system instance
     * @returns The AudioSystem instance
     */
    getAudioSystem(): AudioSystem;
}
