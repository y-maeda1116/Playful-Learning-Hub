/**
 * Core TypeScript interfaces for the Element Symbol Puzzle feature
 */
/**
 * Represents a chemical element with all metadata
 */
export interface Element {
    id: string;
    symbol: string;
    name: string;
    atomicNumber: number;
    atomicWeight: number;
    type: 'metal' | 'nonmetal' | 'metalloid';
    category: 'basic' | 'intermediate' | 'advanced';
    gradeLevel: 3 | 4 | 5 | 6;
    pronunciation: string;
    audioUrl: string;
    commonUses: string[];
    properties: {
        state: 'solid' | 'liquid' | 'gas';
        color: string;
        reactivity: 'high' | 'medium' | 'low';
    };
    periodicTablePosition: {
        period: number;
        group: number;
        category: string;
    };
}
/**
 * Represents a chemical formula
 */
export interface ChemicalFormula {
    id: string;
    formula: string;
    name: string;
    elements: string[];
    gradeLevel: 5 | 6;
    commonUses: string[];
}
/**
 * Represents a periodic table jigsaw puzzle
 */
export interface PeriodicTablePuzzle {
    id: string;
    difficulty: 'easy' | 'medium' | 'hard';
    gradeLevel: 5 | 6;
    elements: Element[];
    totalPieces: number;
    description: string;
}
/**
 * Represents a user's answer in a game session
 */
export interface Answer {
    elementId: string;
    userAnswer: string;
    correct: boolean;
    responseTime: number;
    timestamp: number;
}
/**
 * Represents a game session
 */
export interface GameSession {
    sessionId: string;
    gameType: 'matching' | 'quiz' | 'chemicalFormula' | 'periodicTableJigsaw';
    gradeLevel: 3 | 4 | 5 | 6;
    difficulty: 'easy' | 'medium' | 'hard';
    startTime: number;
    elements: Element[];
    currentIndex: number;
    score: number;
    answers: Answer[];
    correctCount: number;
    totalCount: number;
}
/**
 * Represents a jigsaw puzzle game session
 */
export interface JigsawPuzzleSession extends GameSession {
    gameType: 'periodicTableJigsaw';
    puzzle: PeriodicTablePuzzle;
    placedPieces: Map<string, {
        period: number;
        group: number;
    }>;
    remainingPieces: Element[];
}
/**
 * Represents user progress and learning data
 */
export interface UserProgress {
    userId: string;
    gradeLevel: 3 | 4 | 5 | 6;
    elementsLearned: {
        [elementId: string]: {
            status: 'not-started' | 'learning' | 'mastered';
            attempts: number;
            correctAttempts: number;
            lastAttempt: number;
        };
    };
    totalSessionTime: number;
    sessionCount: number;
    averageAccuracy: number;
    badges: string[];
    streakDays: number;
    lastSessionDate: number;
    jigsawPuzzlesCompleted: number;
}
/**
 * Represents a badge/achievement
 */
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: {
        type: 'elements-learned' | 'accuracy' | 'streak' | 'formula-mastery' | 'jigsaw-completed';
        threshold: number;
    };
    gradeLevel: 3 | 4 | 5 | 6;
}
/**
 * Represents an unlocked achievement
 */
export interface Achievement {
    userId: string;
    badgeId: string;
    unlockedDate: number;
    displayNotification: boolean;
}
