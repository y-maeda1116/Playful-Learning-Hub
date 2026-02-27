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
  difficultyScore: number; // 0-100, used to track progression within difficulty levels
  lastAdjustmentDate: number;
  adjustmentCount: number;
}

/**
 * DifficultyAdjustmentSystem class manages per-user difficulty levels
 */
export class DifficultyAdjustmentSystem {
  private userDifficultyLevels: Map<string, UserDifficultyLevel> = new Map();

  /**
   * Initialize or get user difficulty level
   * @param userId - The user ID
   * @returns The UserDifficultyLevel object
   */
  private initializeUserDifficulty(userId: string): UserDifficultyLevel {
    if (!this.userDifficultyLevels.has(userId)) {
      const difficultyLevel: UserDifficultyLevel = {
        userId,
        currentDifficulty: 'easy',
        difficultyScore: 0,
        lastAdjustmentDate: Date.now(),
        adjustmentCount: 0,
      };
      this.userDifficultyLevels.set(userId, difficultyLevel);
    }
    return this.userDifficultyLevels.get(userId)!;
  }

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
  adjustDifficulty(userId: string, accuracy: number): 'easy' | 'medium' | 'hard' {
    if (!userId || userId.trim() === '') {
      throw new Error('Invalid userId: must not be empty');
    }

    if (accuracy < 0 || accuracy > 100) {
      throw new Error('Invalid accuracy: must be between 0 and 100');
    }

    const difficultyLevel = this.initializeUserDifficulty(userId);

    // Determine difficulty adjustment based on accuracy
    if (accuracy >= 80) {
      // Increase difficulty
      if (difficultyLevel.currentDifficulty === 'easy') {
        difficultyLevel.currentDifficulty = 'medium';
        difficultyLevel.difficultyScore = 0;
      } else if (difficultyLevel.currentDifficulty === 'medium') {
        difficultyLevel.currentDifficulty = 'hard';
        difficultyLevel.difficultyScore = 0;
      }
      // If already at 'hard', stay at 'hard'
    } else if (accuracy < 50) {
      // Decrease difficulty
      if (difficultyLevel.currentDifficulty === 'hard') {
        difficultyLevel.currentDifficulty = 'medium';
        difficultyLevel.difficultyScore = 0;
      } else if (difficultyLevel.currentDifficulty === 'medium') {
        difficultyLevel.currentDifficulty = 'easy';
        difficultyLevel.difficultyScore = 0;
      }
      // If already at 'easy', stay at 'easy'
    } else {
      // Maintain current difficulty, but update difficulty score
      // Score increases with accuracy in the 50-80% range
      difficultyLevel.difficultyScore = accuracy - 50; // 0-30 range
    }

    difficultyLevel.lastAdjustmentDate = Date.now();
    difficultyLevel.adjustmentCount++;

    return difficultyLevel.currentDifficulty;
  }

  /**
   * Get the current difficulty level for a user
   * @param userId - The user ID
   * @returns The current difficulty level
   * @throws Error if userId is invalid
   */
  getCurrentDifficulty(userId: string): 'easy' | 'medium' | 'hard' {
    if (!userId || userId.trim() === '') {
      throw new Error('Invalid userId: must not be empty');
    }

    const difficultyLevel = this.initializeUserDifficulty(userId);
    return difficultyLevel.currentDifficulty;
  }

  /**
   * Get the difficulty progression data for a user
   * @param userId - The user ID
   * @returns The UserDifficultyLevel object
   * @throws Error if userId is invalid
   */
  getDifficultyProgression(userId: string): UserDifficultyLevel {
    if (!userId || userId.trim() === '') {
      throw new Error('Invalid userId: must not be empty');
    }

    const difficultyLevel = this.initializeUserDifficulty(userId);
    return { ...difficultyLevel };
  }

  /**
   * Set the difficulty level for a user (for testing or manual override)
   * @param userId - The user ID
   * @param difficulty - The difficulty level to set
   * @throws Error if userId is invalid or difficulty is invalid
   */
  setDifficulty(userId: string, difficulty: 'easy' | 'medium' | 'hard'): void {
    if (!userId || userId.trim() === '') {
      throw new Error('Invalid userId: must not be empty');
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error(`Invalid difficulty: ${difficulty}. Must be one of ${validDifficulties.join(', ')}.`);
    }

    const difficultyLevel = this.initializeUserDifficulty(userId);
    difficultyLevel.currentDifficulty = difficulty;
    difficultyLevel.difficultyScore = 0;
    difficultyLevel.lastAdjustmentDate = Date.now();
  }

  /**
   * Save difficulty progression to local storage
   * @param userId - The user ID
   * @throws Error if userId is invalid
   */
  saveToLocalStorage(userId: string): void {
    if (!userId || userId.trim() === '') {
      throw new Error('Invalid userId: must not be empty');
    }

    const difficultyLevel = this.initializeUserDifficulty(userId);

    try {
      if (typeof localStorage === 'undefined') {
        // In Node.js test environment, localStorage is not available
        // Skip saving in this case
        return;
      }

      const storageKey = `element-puzzle-difficulty-${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(difficultyLevel));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Load difficulty progression from local storage
   * @param userId - The user ID
   * @returns The loaded UserDifficultyLevel object
   * @throws Error if userId is invalid
   */
  loadFromLocalStorage(userId: string): UserDifficultyLevel {
    if (!userId || userId.trim() === '') {
      throw new Error('Invalid userId: must not be empty');
    }

    try {
      if (typeof localStorage === 'undefined') {
        // In Node.js test environment, localStorage is not available
        // Initialize new difficulty level
        return this.initializeUserDifficulty(userId);
      }

      const storageKey = `element-puzzle-difficulty-${userId}`;
      const storedData = localStorage.getItem(storageKey);

      if (!storedData) {
        // No existing data, initialize new difficulty level
        return this.initializeUserDifficulty(userId);
      }

      const difficultyLevel = JSON.parse(storedData) as UserDifficultyLevel;

      // Validate loaded data
      if (!difficultyLevel.userId || !difficultyLevel.currentDifficulty) {
        throw new Error('Corrupted difficulty data');
      }

      this.userDifficultyLevels.set(userId, difficultyLevel);
      return difficultyLevel;
    } catch (error) {
      // If parsing fails or other error, initialize new difficulty level
      return this.initializeUserDifficulty(userId);
    }
  }

  /**
   * Clear all difficulty data (for testing purposes)
   */
  clearAllDifficulty(): void {
    this.userDifficultyLevels.clear();
  }

  /**
   * Get all users' difficulty levels (for testing purposes)
   * @returns Map of all user difficulty levels
   */
  getAllDifficulty(): Map<string, UserDifficultyLevel> {
    return new Map(this.userDifficultyLevels);
  }
}
