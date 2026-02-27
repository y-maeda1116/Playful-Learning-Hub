/**
 * ElementContentManager - Manages all chemical element and formula content
 * 
 * Provides methods to retrieve elements and chemical formulas based on grade level,
 * category, and other criteria. Handles audio URL retrieval and content organization.
 */

import { Element, ChemicalFormula } from '../data/types';
import { ELEMENTS, CHEMICAL_FORMULAS } from '../data/elements';

/**
 * Manages content for the Element Symbol Puzzle game
 * Provides access to elements, chemical formulas, and related metadata
 */
export class ElementContentManager {
  private elements: Record<string, Element>;
  private chemicalFormulas: Record<string, ChemicalFormula>;

  /**
   * Initialize the ElementContentManager with element and formula databases
   */
  constructor() {
    this.elements = ELEMENTS;
    this.chemicalFormulas = CHEMICAL_FORMULAS;
  }

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
  getElementsByGrade(grade: 3 | 4 | 5 | 6): Element[] {
    if (![3, 4, 5, 6].includes(grade)) {
      throw new Error(`Invalid grade level: ${grade}. Must be 3, 4, 5, or 6.`);
    }

    return Object.values(this.elements).filter((element) => element.gradeLevel <= grade);
  }

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
  getElementsByCategory(category: 'basic' | 'intermediate' | 'advanced'): Element[] {
    if (!['basic', 'intermediate', 'advanced'].includes(category)) {
      throw new Error(`Invalid category: ${category}. Must be 'basic', 'intermediate', or 'advanced'.`);
    }

    return Object.values(this.elements).filter((element) => element.category === category);
  }

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
  getElementAudio(elementId: string): string {
    const element = this.elements[elementId];
    if (!element) {
      throw new Error(`Element not found: ${elementId}`);
    }
    return element.audioUrl;
  }

  /**
   * Get all elements in the database
   * 
   * @returns Array of all 30 elements
   * 
   * @example
   * const allElements = manager.getAllElements();
   * // Returns all 30 elements
   */
  getAllElements(): Element[] {
    return Object.values(this.elements);
  }

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
  getElement(elementId: string): Element | undefined {
    return this.elements[elementId];
  }

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
  getFormulasByGrade(grade: 5 | 6): ChemicalFormula[] {
    if (![5, 6].includes(grade)) {
      throw new Error(`Invalid grade level for formulas: ${grade}. Must be 5 or 6.`);
    }

    return Object.values(this.chemicalFormulas).filter((formula) => formula.gradeLevel <= grade);
  }

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
  getFormula(formulaId: string): ChemicalFormula | undefined {
    return this.chemicalFormulas[formulaId];
  }

  /**
   * Get all chemical formulas in the database
   * 
   * @returns Array of all chemical formulas
   * 
   * @example
   * const allFormulas = manager.getAllFormulas();
   * // Returns all 8 chemical formulas
   */
  getAllFormulas(): ChemicalFormula[] {
    return Object.values(this.chemicalFormulas);
  }

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
  validateFormulaComposition(formulaId: string, selectedElementIds: string[]): boolean {
    const formula = this.chemicalFormulas[formulaId];
    if (!formula) {
      return false;
    }

    // Sort both arrays for comparison
    const formulaElements = formula.elements.sort();
    const selectedElements = selectedElementIds.sort();

    // Check if arrays have the same length and same elements
    if (formulaElements.length !== selectedElements.length) {
      return false;
    }

    return formulaElements.every((element, index) => element === selectedElements[index]);
  }

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
  getFormulaDetails(
    formulaId: string,
  ): (ChemicalFormula & { elementDetails: Element[] }) | undefined {
    const formula = this.chemicalFormulas[formulaId];
    if (!formula) {
      return undefined;
    }

    const elementDetails = formula.elements
      .map((elementId) => this.elements[elementId])
      .filter((element) => element !== undefined);

    return {
      ...formula,
      elementDetails,
    };
  }

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
  getRandomElementsByGrade(grade: 3 | 4 | 5 | 6, count: number): Element[] {
    const gradeElements = this.getElementsByGrade(grade);

    if (count > gradeElements.length) {
      throw new Error(
        `Cannot get ${count} random elements. Only ${gradeElements.length} elements available for grade ${grade}.`,
      );
    }

    // Fisher-Yates shuffle
    const shuffled = [...gradeElements];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }

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
  getRandomFormulasByGrade(grade: 5 | 6, count: number): ChemicalFormula[] {
    const gradeFormulas = this.getFormulasByGrade(grade);

    if (count > gradeFormulas.length) {
      throw new Error(
        `Cannot get ${count} random formulas. Only ${gradeFormulas.length} formulas available for grade ${grade}.`,
      );
    }

    // Fisher-Yates shuffle
    const shuffled = [...gradeFormulas];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }
}
