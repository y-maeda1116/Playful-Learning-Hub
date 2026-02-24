/**
 * UI Components for Element Symbol Puzzle
 *
 * Provides React-like component interfaces and rendering logic for all game modes.
 * Supports matching, quiz, chemical formula, and periodic table jigsaw games.
 */
import { Element, ChemicalFormula, PeriodicTablePuzzle, Badge } from './types';
/**
 * Callback function for user selections
 */
export type SelectionCallback = (value: string) => void;
/**
 * Callback function for drag and drop operations
 */
export type DragDropCallback = (elementId: string, position: {
    period: number;
    group: number;
}) => void;
/**
 * Base UI Component interface
 */
export interface UIComponent {
    render(): HTMLElement;
    destroy(): void;
}
/**
 * Matching Game UI Component
 * Displays element symbols and name options for matching
 */
export declare class MatchingGameUI implements UIComponent {
    private container;
    private currentElement;
    private options;
    private onSelection;
    constructor(currentElement: Element, options: Element[], onSelection: SelectionCallback);
    /**
     * Render the matching game UI
     */
    render(): HTMLElement;
    /**
     * Destroy the component
     */
    destroy(): void;
}
/**
 * Quiz Game UI Component
 * Displays quiz questions with multiple choice options
 */
export declare class QuizGameUI implements UIComponent {
    private container;
    private currentElement;
    private question;
    private options;
    private onSelection;
    constructor(currentElement: Element, question: string, options: string[], onSelection: SelectionCallback);
    /**
     * Render the quiz game UI
     */
    render(): HTMLElement;
    /**
     * Destroy the component
     */
    destroy(): void;
}
/**
 * Chemical Formula Puzzle UI Component
 * Displays chemical formula puzzle with element selection
 */
export declare class ChemicalFormulaPuzzleUI implements UIComponent {
    private container;
    private formula;
    private availableElements;
    private onSelection;
    constructor(formula: ChemicalFormula, availableElements: Element[], onSelection: SelectionCallback);
    /**
     * Render the chemical formula puzzle UI
     */
    render(): HTMLElement;
    /**
     * Destroy the component
     */
    destroy(): void;
}
/**
 * Periodic Table Jigsaw Puzzle UI Component
 * Displays periodic table grid with drag-and-drop puzzle pieces
 */
export declare class PeriodicTableJigsawUI implements UIComponent {
    private container;
    private puzzle;
    private placedPieces;
    private onDragDrop;
    constructor(puzzle: PeriodicTablePuzzle, placedPieces: Map<string, {
        period: number;
        group: number;
    }>, onDragDrop: DragDropCallback);
    /**
     * Render the periodic table jigsaw puzzle UI
     */
    render(): HTMLElement;
    /**
     * Destroy the component
     */
    destroy(): void;
}
/**
 * Progress Tracking UI Component
 * Displays user progress, statistics, and badges
 */
export declare class ProgressTrackingUI implements UIComponent {
    private container;
    private masteryLevel;
    private totalSessionTime;
    private averageAccuracy;
    private badges;
    private unlockedBadges;
    private streakDays;
    constructor(masteryLevel: number, totalSessionTime: number, averageAccuracy: number, badges: Badge[], unlockedBadges: string[], streakDays: number);
    /**
     * Render the progress tracking UI
     */
    render(): HTMLElement;
    /**
     * Destroy the component
     */
    destroy(): void;
}
/**
 * Feedback UI Component
 * Displays feedback for correct/incorrect answers
 */
export declare class FeedbackUI implements UIComponent {
    private container;
    private isCorrect;
    private message;
    private additionalInfo?;
    constructor(isCorrect: boolean, message: string, additionalInfo?: string);
    /**
     * Render the feedback UI
     */
    render(): HTMLElement;
    /**
     * Destroy the component
     */
    destroy(): void;
}
/**
 * Reward Notification UI Component
 * Displays badge and achievement notifications
 */
export declare class RewardNotificationUI implements UIComponent {
    private container;
    private badge;
    private message;
    constructor(badge: Badge, message: string);
    /**
     * Render the reward notification UI
     */
    render(): HTMLElement;
    /**
     * Destroy the component
     */
    destroy(): void;
}
