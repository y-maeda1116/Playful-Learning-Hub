/**
 * Element Database for Element Symbol Puzzle
 *
 * Contains 30 chemical elements organized by grade level (3-6)
 * with complete metadata including symbols, names, atomic numbers,
 * properties, audio URLs, and common uses.
 */
import { Element } from './types';
/**
 * Complete element database with 30 elements
 * Organized by grade level: 3-4 (basic 15), 5 (intermediate 10), 6 (advanced 5)
 */
export declare const ELEMENTS: Record<string, Element>;
/**
 * Chemical formulas database for grades 5-6
 */
export declare const CHEMICAL_FORMULAS: {
    H2O: {
        id: string;
        formula: string;
        name: string;
        elements: string[];
        gradeLevel: 5;
        commonUses: string[];
    };
    CO2: {
        id: string;
        formula: string;
        name: string;
        elements: string[];
        gradeLevel: 5;
        commonUses: string[];
    };
    NaCl: {
        id: string;
        formula: string;
        name: string;
        elements: string[];
        gradeLevel: 5;
        commonUses: string[];
    };
    CaCO3: {
        id: string;
        formula: string;
        name: string;
        elements: string[];
        gradeLevel: 5;
        commonUses: string[];
    };
    H2SO4: {
        id: string;
        formula: string;
        name: string;
        elements: string[];
        gradeLevel: 6;
        commonUses: string[];
    };
    'Ca(OH)2': {
        id: string;
        formula: string;
        name: string;
        elements: string[];
        gradeLevel: 6;
        commonUses: string[];
    };
    NH3: {
        id: string;
        formula: string;
        name: string;
        elements: string[];
        gradeLevel: 6;
        commonUses: string[];
    };
    CH4: {
        id: string;
        formula: string;
        name: string;
        elements: string[];
        gradeLevel: 6;
        commonUses: string[];
    };
};
