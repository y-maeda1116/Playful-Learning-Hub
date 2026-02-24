/**
 * Badge definitions and criteria for the Element Symbol Puzzle reward system
 * Defines badges for elements learned, accuracy milestones, consecutive learning days, and formula mastery
 */
import { Badge } from './types';
/**
 * Badge definitions for the Element Symbol Puzzle system
 * Organized by category: elements-learned, accuracy, streak, and formula-mastery
 */
export declare const BADGES: {
    [key: string]: Badge;
};
/**
 * Get all badges for a specific grade level
 * @param gradeLevel - The grade level (3, 4, 5, or 6)
 * @returns Array of badges available for that grade level
 */
export declare function getBadgesByGrade(gradeLevel: 3 | 4 | 5 | 6): Badge[];
/**
 * Get a badge by its ID
 * @param badgeId - The badge ID
 * @returns The badge object or undefined if not found
 */
export declare function getBadgeById(badgeId: string): Badge | undefined;
/**
 * Get all badges of a specific type
 * @param type - The badge criteria type
 * @returns Array of badges matching the type
 */
export declare function getBadgesByType(type: 'elements-learned' | 'accuracy' | 'streak' | 'formula-mastery' | 'jigsaw-completed'): Badge[];
/**
 * Get the threshold value for a specific badge type
 * @param type - The badge criteria type
 * @param threshold - The threshold value to match
 * @returns The badge object or undefined if not found
 */
export declare function getBadgeByTypeAndThreshold(type: 'elements-learned' | 'accuracy' | 'streak' | 'formula-mastery' | 'jigsaw-completed', threshold: number): Badge | undefined;
