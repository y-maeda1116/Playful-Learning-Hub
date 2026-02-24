/**
 * PeriodicTableManager - Manages periodic table jigsaw puzzle functionality
 * 
 * Provides methods to create, validate, and manage periodic table jigsaw puzzles
 * with different difficulty levels.
 */

import { Element, PeriodicTablePuzzle } from './types';
import { ElementContentManager } from './ElementContentManager';

/**
 * Manages periodic table jigsaw puzzle content and logic
 */
export class PeriodicTableManager {
  private contentManager: ElementContentManager;
  private puzzles: Map<string, PeriodicTablePuzzle> = new Map();

  constructor() {
    this.contentManager = new ElementContentManager();
    this.initializePuzzles();
  }

  /**
   * Initialize periodic table puzzles with different difficulty levels
   */
  private initializePuzzles(): void {
    const allElements = this.contentManager.getAllElements();

    // Easy puzzle: 15 basic elements (grade 5)
    const easyElements = allElements.filter((e) => e.gradeLevel <= 4);
    this.puzzles.set('easy', {
      id: 'easy',
      difficulty: 'easy',
      gradeLevel: 5,
      elements: easyElements,
      totalPieces: easyElements.length,
      description: '基本的な元素で周期表を完成させよう',
    });

    // Medium puzzle: 25 elements (grade 5)
    const mediumElements = allElements.filter((e) => e.gradeLevel <= 5);
    this.puzzles.set('medium', {
      id: 'medium',
      difficulty: 'medium',
      gradeLevel: 5,
      elements: mediumElements,
      totalPieces: mediumElements.length,
      description: '25個の元素で周期表を完成させよう',
    });

    // Hard puzzle: all 30 elements (grade 6)
    this.puzzles.set('hard', {
      id: 'hard',
      difficulty: 'hard',
      gradeLevel: 6,
      elements: allElements,
      totalPieces: allElements.length,
      description: '全30個の元素で周期表を完成させよう',
    });
  }

  /**
   * Get a periodic table puzzle by difficulty level
   * 
   * @param difficulty - Difficulty level ('easy', 'medium', or 'hard')
   * @returns The periodic table puzzle
   * @throws Error if difficulty is invalid
   */
  getPuzzle(difficulty: 'easy' | 'medium' | 'hard'): PeriodicTablePuzzle {
    const puzzle = this.puzzles.get(difficulty);
    if (!puzzle) {
      throw new Error(`Invalid difficulty level: ${difficulty}`);
    }
    return puzzle;
  }

  /**
   * Get all available puzzles
   * 
   * @returns Array of all periodic table puzzles
   */
  getAllPuzzles(): PeriodicTablePuzzle[] {
    return Array.from(this.puzzles.values());
  }

  /**
   * Validate that an element can be placed at a specific position
   * 
   * @param element - The element to place
   * @param period - The period (row) number (1-7)
   * @param group - The group (column) number (1-18)
   * @returns true if the element belongs at this position, false otherwise
   */
  validateElementPlacement(element: Element, period: number, group: number): boolean {
    // Check if position is within valid range
    if (period < 1 || period > 7 || group < 1 || group > 18) {
      return false;
    }

    // Check if element's periodic table position matches
    return (
      element.periodicTablePosition.period === period &&
      element.periodicTablePosition.group === group
    );
  }

  /**
   * Get the element at a specific periodic table position
   * 
   * @param period - The period (row) number (1-7)
   * @param group - The group (column) number (1-18)
   * @returns The element at this position, or undefined if no element exists
   */
  getElementAtPosition(period: number, group: number): Element | undefined {
    const allElements = this.contentManager.getAllElements();
    return allElements.find(
      (e) =>
        e.periodicTablePosition.period === period &&
        e.periodicTablePosition.group === group,
    );
  }

  /**
   * Get all elements in a specific period (row)
   * 
   * @param period - The period number (1-7)
   * @returns Array of elements in the period
   */
  getElementsByPeriod(period: number): Element[] {
    const allElements = this.contentManager.getAllElements();
    return allElements.filter((e) => e.periodicTablePosition.period === period);
  }

  /**
   * Get all elements in a specific group (column)
   * 
   * @param group - The group number (1-18)
   * @returns Array of elements in the group
   */
  getElementsByGroup(group: number): Element[] {
    const allElements = this.contentManager.getAllElements();
    return allElements.filter((e) => e.periodicTablePosition.group === group);
  }

  /**
   * Get all elements in a specific category (e.g., alkali metals, halogens)
   * 
   * @param category - The element category
   * @returns Array of elements in the category
   */
  getElementsByCategory(category: string): Element[] {
    const allElements = this.contentManager.getAllElements();
    return allElements.filter((e) => e.periodicTablePosition.category === category);
  }

  /**
   * Check if a puzzle is complete
   * 
   * @param placedPieces - Map of placed element IDs to their positions
   * @param puzzle - The puzzle to check
   * @returns true if all pieces are correctly placed, false otherwise
   */
  isPuzzleComplete(
    placedPieces: Map<string, { period: number; group: number }>,
    puzzle: PeriodicTablePuzzle,
  ): boolean {
    // Check if all elements in the puzzle are placed
    if (placedPieces.size !== puzzle.elements.length) {
      return false;
    }

    // Check if all placements are correct
    for (const [elementId, position] of placedPieces.entries()) {
      const element = puzzle.elements.find((e) => e.id === elementId);
      if (!element) {
        return false;
      }

      if (!this.validateElementPlacement(element, position.period, position.group)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get puzzle information for a specific grade level
   * 
   * @param gradeLevel - The grade level (5 or 6)
   * @returns The recommended puzzle for the grade level
   */
  getPuzzleForGrade(gradeLevel: 5 | 6): PeriodicTablePuzzle {
    if (gradeLevel === 5) {
      return this.getPuzzle('medium');
    } else {
      return this.getPuzzle('hard');
    }
  }

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
  } {
    const periods = new Set(puzzle.elements.map((e) => e.periodicTablePosition.period));
    const groups = new Set(puzzle.elements.map((e) => e.periodicTablePosition.group));
    const categories = new Set(puzzle.elements.map((e) => e.periodicTablePosition.category));

    return {
      periodsInfo: `周期: ${Array.from(periods).sort().join(', ')}`,
      groupsInfo: `族: ${Array.from(groups).sort((a, b) => a - b).join(', ')}`,
      categoriesInfo: `分類: ${Array.from(categories).join(', ')}`,
    };
  }

  /**
   * Get statistics about puzzle completion
   * 
   * @param placedPieces - Map of placed element IDs to their positions
   * @param puzzle - The puzzle being worked on
   * @returns Statistics about puzzle progress
   */
  getPuzzleStats(
    placedPieces: Map<string, { period: number; group: number }>,
    puzzle: PeriodicTablePuzzle,
  ): {
    placed: number;
    total: number;
    percentage: number;
    remaining: number;
  } {
    const placed = placedPieces.size;
    const total = puzzle.totalPieces;
    const percentage = (placed / total) * 100;
    const remaining = total - placed;

    return { placed, total, percentage, remaining };
  }
}
