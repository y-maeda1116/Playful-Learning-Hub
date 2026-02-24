/**
 * PeriodicTableManager - Manages periodic table jigsaw puzzle functionality
 *
 * Provides methods to create, validate, and manage periodic table jigsaw puzzles
 * with different difficulty levels.
 */
import { Element, PeriodicTablePuzzle } from './types';
/**
 * Manages periodic table jigsaw puzzle content and logic
 */
export declare class PeriodicTableManager {
    private contentManager;
    private puzzles;
    constructor();
    /**
     * Initialize periodic table puzzles with different difficulty levels
     */
    private initializePuzzles;
    /**
     * Get a periodic table puzzle by difficulty level
     *
     * @param difficulty - Difficulty level ('easy', 'medium', or 'hard')
     * @returns The periodic table puzzle
     * @throws Error if difficulty is invalid
     */
    getPuzzle(difficulty: 'easy' | 'medium' | 'hard'): PeriodicTablePuzzle;
    /**
     * Get all available puzzles
     *
     * @returns Array of all periodic table puzzles
     */
    getAllPuzzles(): PeriodicTablePuzzle[];
    /**
     * Validate that an element can be placed at a specific position
     *
     * @param element - The element to place
     * @param period - The period (row) number (1-7)
     * @param group - The group (column) number (1-18)
     * @returns true if the element belongs at this position, false otherwise
     */
    validateElementPlacement(element: Element, period: number, group: number): boolean;
    /**
     * Get the element at a specific periodic table position
     *
     * @param period - The period (row) number (1-7)
     * @param group - The group (column) number (1-18)
     * @returns The element at this position, or undefined if no element exists
     */
    getElementAtPosition(period: number, group: number): Element | undefined;
    /**
     * Get all elements in a specific period (row)
     *
     * @param period - The period number (1-7)
     * @returns Array of elements in the period
     */
    getElementsByPeriod(period: number): Element[];
    /**
     * Get all elements in a specific group (column)
     *
     * @param group - The group number (1-18)
     * @returns Array of elements in the group
     */
    getElementsByGroup(group: number): Element[];
    /**
     * Get all elements in a specific category (e.g., alkali metals, halogens)
     *
     * @param category - The element category
     * @returns Array of elements in the category
     */
    getElementsByCategory(category: string): Element[];
    /**
     * Check if a puzzle is complete
     *
     * @param placedPieces - Map of placed element IDs to their positions
     * @param puzzle - The puzzle to check
     * @returns true if all pieces are correctly placed, false otherwise
     */
    isPuzzleComplete(placedPieces: Map<string, {
        period: number;
        group: number;
    }>, puzzle: PeriodicTablePuzzle): boolean;
    /**
     * Get puzzle information for a specific grade level
     *
     * @param gradeLevel - The grade level (5 or 6)
     * @returns The recommended puzzle for the grade level
     */
    getPuzzleForGrade(gradeLevel: 5 | 6): PeriodicTablePuzzle;
    /**
     * Get learning information about a completed puzzle
     *
     * @param puzzle - The completed puzzle
     * @returns Learning information about the periodic table structure
     */
    getLearningInfo(puzzle: PeriodicTablePuzzle): {
        periodsInfo: string;
        groupsInfo: string;
        categoriesInfo: string;
    };
    /**
     * Get statistics about puzzle completion
     *
     * @param placedPieces - Map of placed element IDs to their positions
     * @param puzzle - The puzzle being worked on
     * @returns Statistics about puzzle progress
     */
    getPuzzleStats(placedPieces: Map<string, {
        period: number;
        group: number;
    }>, puzzle: PeriodicTablePuzzle): {
        placed: number;
        total: number;
        percentage: number;
        remaining: number;
    };
}
