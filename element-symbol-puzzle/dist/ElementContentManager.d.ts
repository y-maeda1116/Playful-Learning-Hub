/**
 * ElementContentManager - Manages all chemical element and formula content
 *
 * Provides methods to retrieve elements and chemical formulas based on grade level,
 * category, and other criteria. Handles audio URL retrieval and content organization.
 */
import { Element, ChemicalFormula } from './types';
/**
 * Manages content for the Element Symbol Puzzle game
 * Provides access to elements, chemical formulas, and related metadata
 */
export declare class ElementContentManager {
    private elements;
    private chemicalFormulas;
    /**
     * Initialize the ElementContentManager with element and formula databases
     */
    constructor();
    /**
     * Get all elements for a specific grade level
     *
     * @param grade - Grade level (3, 4, 5, or 6)
     * @returns Array of elements appropriate for the specified grade
     * @throws Error if grade is not between 3 and 6
     *
     * @example
     * const grade3Elements = manager.getElementsByGrade(3);
     * // Returns 15 basic elements for grade 3
     */
    getElementsByGrade(grade: 3 | 4 | 5 | 6): Element[];
    /**
     * Get elements by category
     *
     * @param category - Category type ('basic', 'intermediate', or 'advanced')
     * @returns Array of elements in the specified category
     * @throws Error if category is invalid
     *
     * @example
     * const basicElements = manager.getElementsByCategory('basic');
     * // Returns 15 basic elements
     */
    getElementsByCategory(category: 'basic' | 'intermediate' | 'advanced'): Element[];
    /**
     * Get the audio URL for an element's pronunciation
     *
     * @param elementId - The element symbol (e.g., 'H', 'O', 'Ca')
     * @returns The audio URL for the element's pronunciation
     * @throws Error if element is not found
     *
     * @example
     * const audioUrl = manager.getElementAudio('H');
     * // Returns '/audio/elements/H.mp3'
     */
    getElementAudio(elementId: string): string;
    /**
     * Get all elements in the database
     *
     * @returns Array of all 30 elements
     *
     * @example
     * const allElements = manager.getAllElements();
     * // Returns all 30 elements
     */
    getAllElements(): Element[];
    /**
     * Get a specific element by its symbol
     *
     * @param elementId - The element symbol (e.g., 'H', 'O', 'Ca')
     * @returns The element object, or undefined if not found
     *
     * @example
     * const hydrogen = manager.getElement('H');
     * // Returns the hydrogen element object
     */
    getElement(elementId: string): Element | undefined;
    /**
     * Get all chemical formulas for a specific grade level
     *
     * @param grade - Grade level (5 or 6)
     * @returns Array of chemical formulas appropriate for the specified grade
     * @throws Error if grade is not 5 or 6
     *
     * @example
     * const grade5Formulas = manager.getFormulasByGrade(5);
     * // Returns formulas like H2O, CO2, NaCl, CaCO3
     */
    getFormulasByGrade(grade: 5 | 6): ChemicalFormula[];
    /**
     * Get a specific chemical formula by its ID
     *
     * @param formulaId - The formula ID (e.g., 'H2O', 'CO2')
     * @returns The chemical formula object, or undefined if not found
     *
     * @example
     * const water = manager.getFormula('H2O');
     * // Returns the water formula object
     */
    getFormula(formulaId: string): ChemicalFormula | undefined;
    /**
     * Get all chemical formulas in the database
     *
     * @returns Array of all chemical formulas
     *
     * @example
     * const allFormulas = manager.getAllFormulas();
     * // Returns all 8 chemical formulas
     */
    getAllFormulas(): ChemicalFormula[];
    /**
     * Validate that a chemical formula composition is correct
     *
     * @param formulaId - The formula ID to validate
     * @param selectedElementIds - Array of element symbols selected by the user
     * @returns true if the selected elements match the formula composition, false otherwise
     *
     * @example
     * const isValid = manager.validateFormulaComposition('H2O', ['H', 'O']);
     * // Returns true
     */
    validateFormulaComposition(formulaId: string, selectedElementIds: string[]): boolean;
    /**
     * Get formula details including all constituent elements
     *
     * @param formulaId - The formula ID
     * @returns Object containing formula details and element information, or undefined if not found
     *
     * @example
     * const details = manager.getFormulaDetails('H2O');
     * // Returns formula with element details
     */
    getFormulaDetails(formulaId: string): (ChemicalFormula & {
        elementDetails: Element[];
    }) | undefined;
    /**
     * Get random elements from a specific grade level
     * Useful for generating quiz questions
     *
     * @param grade - Grade level (3, 4, 5, or 6)
     * @param count - Number of random elements to return
     * @returns Array of random elements
     * @throws Error if count exceeds available elements for the grade
     *
     * @example
     * const randomElements = manager.getRandomElementsByGrade(3, 5);
     * // Returns 5 random elements from grade 3
     */
    getRandomElementsByGrade(grade: 3 | 4 | 5 | 6, count: number): Element[];
    /**
     * Get random chemical formulas from a specific grade level
     * Useful for generating formula puzzle questions
     *
     * @param grade - Grade level (5 or 6)
     * @param count - Number of random formulas to return
     * @returns Array of random chemical formulas
     * @throws Error if count exceeds available formulas for the grade
     *
     * @example
     * const randomFormulas = manager.getRandomFormulasByGrade(5, 2);
     * // Returns 2 random formulas from grade 5
     */
    getRandomFormulasByGrade(grade: 5 | 6, count: number): ChemicalFormula[];
}
