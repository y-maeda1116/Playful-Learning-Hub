/**
 * Game Engine for Element Symbol Puzzle
 * 
 * Manages game sessions, answer validation, and scoring for all game modes.
 * Supports matching, quiz, chemical formula, and periodic table jigsaw games.
 * Integrates with DifficultyAdjustmentSystem for dynamic difficulty scaling.
 */

import { Element, GameSession, Answer } from '../data/types';
import { ElementContentManager } from '../managers/ElementContentManager';
import { DifficultyAdjustmentSystem } from './DifficultyAdjustmentSystem';
import { AudioSystem } from './AudioSystem';

/**
 * GameEngine class manages game sessions and game logic
 */
export class GameEngine {
  private contentManager: ElementContentManager;
  private difficultySystem: DifficultyAdjustmentSystem;
  private audioSystem: AudioSystem;
  private sessions: Map<string, GameSession> = new Map();
  private answerStartTimes: Map<string, number> = new Map(); // Track when answer submission started
  private sessionUserIds: Map<string, string> = new Map(); // Track userId for each session

  constructor(difficultySystem?: DifficultyAdjustmentSystem, audioSystem?: AudioSystem) {
    this.contentManager = new ElementContentManager();
    this.difficultySystem = difficultySystem || new DifficultyAdjustmentSystem();
    this.audioSystem = audioSystem || new AudioSystem();
  }

  /**
   * Start a new game session with specified game type and grade level
   * Loads the user's current difficulty level from DifficultyAdjustmentSystem
   * @param gameType - The type of game ('matching', 'quiz', 'chemicalFormula', 'periodicTableJigsaw')
   * @param gradeLevel - The grade level (3-6)
   * @param userId - Optional user ID to load difficulty progression. If not provided, defaults to 'default-user'
   * @returns A new GameSession with difficulty set based on user's previous performance
   * @throws Error if gameType is invalid or gradeLevel is out of range
   */
  startSession(
    gameType: 'matching' | 'quiz' | 'chemicalFormula' | 'periodicTableJigsaw',
    gradeLevel: 3 | 4 | 5 | 6,
    userId?: string,
  ): GameSession {
    // Validate grade level
    if (![3, 4, 5, 6].includes(gradeLevel)) {
      throw new Error(`Invalid grade level: ${gradeLevel}. Must be 3, 4, 5, or 6.`);
    }

    // Validate game type
    const validGameTypes = ['matching', 'quiz', 'chemicalFormula', 'periodicTableJigsaw'];
    if (!validGameTypes.includes(gameType)) {
      throw new Error(`Invalid game type: ${gameType}. Must be one of ${validGameTypes.join(', ')}.`);
    }

    // Validate grade level for specific game types
    if ((gameType === 'quiz' || gameType === 'chemicalFormula') && ![5, 6].includes(gradeLevel)) {
      throw new Error(`Game type '${gameType}' requires grade level 5 or 6, got ${gradeLevel}.`);
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const elements = this.contentManager.getElementsByGrade(gradeLevel);
    
    // Load user's current difficulty level from DifficultyAdjustmentSystem
    const effectiveUserId = userId || 'default-user';
    const userDifficulty = this.difficultySystem.getCurrentDifficulty(effectiveUserId);

    const session: GameSession = {
      sessionId,
      gameType,
      gradeLevel,
      difficulty: userDifficulty,
      startTime: Date.now(),
      elements,
      currentIndex: 0,
      score: 0,
      answers: [],
      correctCount: 0,
      totalCount: elements.length,
    };

    this.sessions.set(sessionId, session);
    this.sessionUserIds.set(sessionId, effectiveUserId);
    return session;
  }

  /**
   * Start a new matching game session (convenience method)
   * @param gradeLevel - The grade level (3-6)
   * @param userId - Optional user ID to load difficulty progression
   * @returns A new GameSession with gameType 'matching'
   */
  startMatchingSession(gradeLevel: 3 | 4 | 5 | 6, userId?: string): GameSession {
    return this.startSession('matching', gradeLevel, userId);
  }

  /**
   * Start a new quiz game session (convenience method)
   * @param gradeLevel - The grade level (5 or 6 for quiz)
   * @param userId - Optional user ID to load difficulty progression
   * @returns A new GameSession with gameType 'quiz'
   */
  startQuizSession(gradeLevel: 5 | 6, userId?: string): GameSession {
    return this.startSession('quiz', gradeLevel, userId);
  }

  /**
   * Start tracking response time for the current question
   * Call this when a question is displayed to the user
   * @param sessionId - The session ID
   */
  startAnswerTimer(sessionId: string): void {
    this.answerStartTimes.set(sessionId, Date.now());
  }

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
  submitAnswer(sessionId: string, userAnswer: string): Answer {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.currentIndex >= session.elements.length) {
      throw new Error('Game session has ended');
    }

    const currentElement = session.elements[session.currentIndex];
    let correct = false;

    // Validate answer based on game type
    if (session.gameType === 'matching') {
      // For matching: check if answer matches element name
      correct = userAnswer.toLowerCase().trim() === currentElement.name.toLowerCase().trim();
    } else if (session.gameType === 'quiz') {
      // For quiz: check if answer matches element properties
      const normalizedAnswer = userAnswer.toLowerCase().trim();
      const elementType = currentElement.type.toLowerCase().trim();
      const elementReactivity = currentElement.properties.reactivity.toLowerCase().trim();
      const elementState = currentElement.properties.state.toLowerCase().trim();

      correct =
        normalizedAnswer === elementType ||
        normalizedAnswer === elementReactivity ||
        normalizedAnswer === elementState;
    } else if (session.gameType === 'chemicalFormula') {
      // For chemical formula: check if answer matches element symbol
      correct = userAnswer.toLowerCase().trim() === currentElement.symbol.toLowerCase().trim();
    }

    // Calculate response time (in milliseconds)
    const startTime = this.answerStartTimes.get(sessionId) || session.startTime;
    const responseTime = Date.now() - startTime;

    const answer: Answer = {
      elementId: currentElement.id,
      userAnswer,
      correct,
      responseTime,
      timestamp: Date.now(),
    };

    session.answers.push(answer);

    if (correct) {
      session.correctCount++;
      session.score += 10; // Award 10 points per correct answer
    }

    session.currentIndex++;

    // Reset timer for next question
    this.answerStartTimes.delete(sessionId);

    return answer;
  }

  /**
   * Get the current session
   * @param sessionId - The session ID
   * @returns The GameSession
   */
  getSession(sessionId: string): GameSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return session;
  }

  /**
   * Calculate the final score for a session
   * @param sessionId - The session ID
   * @returns The final score
   */
  calculateScore(sessionId: string): number {
    const session = this.getSession(sessionId);
    return session.score;
  }

  /**
   * Calculate the accuracy (正答率) for a session
   * @param sessionId - The session ID
   * @returns The accuracy as a percentage (0-100)
   */
  calculateAccuracy(sessionId: string): number {
    const session = this.getSession(sessionId);
    if (session.totalCount === 0) {
      return 0;
    }
    return (session.correctCount / session.totalCount) * 100;
  }

  /**
   * Calculate the average response time for a session
   * @param sessionId - The session ID
   * @returns The average response time in milliseconds
   */
  calculateAverageResponseTime(sessionId: string): number {
    const session = this.getSession(sessionId);
    if (session.answers.length === 0) {
      return 0;
    }
    const totalTime = session.answers.reduce((sum, answer) => sum + answer.responseTime, 0);
    return totalTime / session.answers.length;
  }

  /**
   * End a game session
   * @param sessionId - The session ID
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    // Session is kept in memory for review, but marked as ended
    // In a real implementation, this would be persisted
  }

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
  adjustDifficultyAfterSession(sessionId: string): 'easy' | 'medium' | 'hard' {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const userId = this.sessionUserIds.get(sessionId);
    if (!userId) {
      throw new Error(`User ID not found for session ${sessionId}`);
    }

    // Calculate accuracy for this session
    const accuracy = this.calculateAccuracy(sessionId);

    // Adjust difficulty based on accuracy
    const newDifficulty = this.difficultySystem.adjustDifficulty(userId, accuracy);

    // Persist the difficulty change to local storage
    this.difficultySystem.saveToLocalStorage(userId);

    return newDifficulty;
  }

  /**
   * Get the next question element
   * @param sessionId - The session ID
   * @returns The next Element to be answered
   */
  getNextQuestion(sessionId: string): Element | null {
    const session = this.getSession(sessionId);
    if (session.currentIndex >= session.elements.length) {
      return null;
    }
    return session.elements[session.currentIndex];
  }

  /**
   * Submit a quiz answer for the current question (convenience method)
   * For quiz games: userAnswer can be element type, reactivity, or other properties
   * @param sessionId - The session ID
   * @param userAnswer - The user's answer (element property value)
   * @returns The Answer object with correctness information
   * @throws Error if session is not a quiz session
   */
  submitQuizAnswer(sessionId: string, userAnswer: string): Answer {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.gameType !== 'quiz') {
      throw new Error('This method is only for quiz sessions');
    }

    return this.submitAnswer(sessionId, userAnswer);
  }

  /**
   * Play audio for element pronunciation when element is selected
   * @param element - The element to play audio for
   * @returns A promise that resolves when audio playback completes or fails gracefully
   */
  async playElementAudio(element: Element): Promise<void> {
    try {
      await this.audioSystem.playAudio(element.audioUrl, {
        volume: 0.8,
      });
    } catch (error) {
      // Silently fail - audio is optional
      console.debug(`Audio playback failed for element ${element.symbol}:`, error);
    }
  }

  /**
   * Play audio feedback for correct answer
   * @returns A promise that resolves when audio playback completes or fails gracefully
   */
  async playCorrectFeedbackAudio(): Promise<void> {
    try {
      // Create a simple success tone using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Play a pleasant "ding" sound (C5 note)
      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silently fail - audio is optional
      console.debug('Correct feedback audio failed:', error);
    }
  }

  /**
   * Play audio feedback for incorrect answer
   * @returns A promise that resolves when audio playback completes or fails gracefully
   */
  async playIncorrectFeedbackAudio(): Promise<void> {
    try {
      // Create a simple error tone using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Play a lower "buzz" sound (A3 note)
      oscillator.frequency.value = 220; // A3
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silently fail - audio is optional
      console.debug('Incorrect feedback audio failed:', error);
    }
  }

  /**
   * Play audio notification for reward/badge achievement
   * @returns A promise that resolves when audio playback completes or fails gracefully
   */
  async playRewardNotificationAudio(): Promise<void> {
    try {
      // Create a celebratory tone sequence using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Play a sequence of notes: C5, E5, G5 (C major chord)
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const noteDuration = 0.15;
      const delayBetweenNotes = 0.1;

      for (let i = 0; i < notes.length; i++) {
        const startTime = audioContext.currentTime + i * (noteDuration + delayBetweenNotes);

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = notes[i];
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

        oscillator.start(startTime);
        oscillator.stop(startTime + noteDuration);
      }
    } catch (error) {
      // Silently fail - audio is optional
      console.debug('Reward notification audio failed:', error);
    }
  }

  /**
   * Get the audio system instance
   * @returns The AudioSystem instance
   */
  getAudioSystem(): AudioSystem {
    return this.audioSystem;
  }
}
