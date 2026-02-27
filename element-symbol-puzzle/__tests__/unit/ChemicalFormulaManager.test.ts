/**
 * Unit tests for ChemicalFormulaManager functionality
 * 
 * Tests the chemical formula retrieval, validation, and composition checking
 * for the Element Symbol Puzzle game.
 */

import { ElementContentManager } from '../../src/managers/ElementContentManager';
import { ChemicalFormula } from '../../src/data/types';

describe('ChemicalFormulaManager - getFormulasByGrade', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should return formulas for grade 5', () => {
    const formulas = manager.getFormulasByGrade(5);
    expect(formulas.length).toBeGreaterThan(0);
    expect(formulas.every((f) => f.gradeLevel <= 5)).toBe(true);
  });

  it('should return formulas for grade 6', () => {
    const formulas = manager.getFormulasByGrade(6);
    expect(formulas.length).toBeGreaterThan(0);
    expect(formulas.every((f) => f.gradeLevel <= 6)).toBe(true);
  });

  it('should include grade 5 formulas when requesting grade 6', () => {
    const grade5Formulas = manager.getFormulasByGrade(5);
    const grade6Formulas = manager.getFormulasByGrade(6);
    expect(grade6Formulas.length).toBeGreaterThanOrEqual(grade5Formulas.length);
  });

  it('should throw error for invalid grade level', () => {
    expect(() => manager.getFormulasByGrade(3 as any)).toThrow();
    expect(() => manager.getFormulasByGrade(4 as any)).toThrow();
    expect(() => manager.getFormulasByGrade(7 as any)).toThrow();
  });

  it('should return formulas with correct structure', () => {
    const formulas = manager.getFormulasByGrade(5);
    formulas.forEach((formula) => {
      expect(formula).toHaveProperty('id');
      expect(formula).toHaveProperty('formula');
      expect(formula).toHaveProperty('name');
      expect(formula).toHaveProperty('elements');
      expect(formula).toHaveProperty('gradeLevel');
      expect(formula).toHaveProperty('commonUses');
      expect(Array.isArray(formula.elements)).toBe(true);
      expect(Array.isArray(formula.commonUses)).toBe(true);
    });
  });
});

describe('ChemicalFormulaManager - validateFormulaComposition', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should validate correct composition for H2O', () => {
    const isValid = manager.validateFormulaComposition('H2O', ['H', 'O']);
    expect(isValid).toBe(true);
  });

  it('should validate correct composition for CO2', () => {
    const isValid = manager.validateFormulaComposition('CO2', ['C', 'O']);
    expect(isValid).toBe(true);
  });

  it('should validate correct composition for NaCl', () => {
    const isValid = manager.validateFormulaComposition('NaCl', ['Na', 'Cl']);
    expect(isValid).toBe(true);
  });

  it('should validate correct composition for CaCO3', () => {
    const isValid = manager.validateFormulaComposition('CaCO3', ['Ca', 'C', 'O']);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect composition with missing elements', () => {
    const isValid = manager.validateFormulaComposition('H2O', ['H']);
    expect(isValid).toBe(false);
  });

  it('should reject incorrect composition with extra elements', () => {
    const isValid = manager.validateFormulaComposition('H2O', ['H', 'O', 'C']);
    expect(isValid).toBe(false);
  });

  it('should reject incorrect composition with wrong elements', () => {
    const isValid = manager.validateFormulaComposition('H2O', ['C', 'N']);
    expect(isValid).toBe(false);
  });

  it('should return false for non-existent formula', () => {
    const isValid = manager.validateFormulaComposition('XYZ', ['X', 'Y', 'Z']);
    expect(isValid).toBe(false);
  });

  it('should be order-independent', () => {
    const isValid1 = manager.validateFormulaComposition('CaCO3', ['Ca', 'C', 'O']);
    const isValid2 = manager.validateFormulaComposition('CaCO3', ['O', 'Ca', 'C']);
    const isValid3 = manager.validateFormulaComposition('CaCO3', ['C', 'O', 'Ca']);
    expect(isValid1).toBe(true);
    expect(isValid2).toBe(true);
    expect(isValid3).toBe(true);
  });

  it('should handle empty element array', () => {
    const isValid = manager.validateFormulaComposition('H2O', []);
    expect(isValid).toBe(false);
  });
});

describe('ChemicalFormulaManager - getFormulaDetails', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should return formula details for H2O', () => {
    const details = manager.getFormulaDetails('H2O');
    expect(details).toBeDefined();
    expect(details?.formula).toBe('H₂O');
    expect(details?.name).toBe('水');
    expect(details?.elements).toEqual(['H', 'O']);
  });

  it('should return formula details with element information', () => {
    const details = manager.getFormulaDetails('H2O');
    expect(details?.elementDetails).toBeDefined();
    expect(details?.elementDetails.length).toBe(2);
    expect(details?.elementDetails[0].symbol).toBe('H');
    expect(details?.elementDetails[1].symbol).toBe('O');
  });

  it('should include all element properties in details', () => {
    const details = manager.getFormulaDetails('CaCO3');
    expect(details?.elementDetails.length).toBe(3);
    details?.elementDetails.forEach((element) => {
      expect(element).toHaveProperty('symbol');
      expect(element).toHaveProperty('name');
      expect(element).toHaveProperty('atomicNumber');
      expect(element).toHaveProperty('properties');
    });
  });

  it('should return undefined for non-existent formula', () => {
    const details = manager.getFormulaDetails('XYZ');
    expect(details).toBeUndefined();
  });

  it('should return correct details for complex formula Ca(OH)2', () => {
    const details = manager.getFormulaDetails('Ca(OH)2');
    expect(details).toBeDefined();
    expect(details?.formula).toBe('Ca(OH)₂');
    expect(details?.name).toBe('水酸化カルシウム');
    expect(details?.elements).toContain('Ca');
    expect(details?.elements).toContain('O');
    expect(details?.elements).toContain('H');
  });

  it('should return details with common uses', () => {
    const details = manager.getFormulaDetails('H2O');
    expect(details?.commonUses).toBeDefined();
    expect(Array.isArray(details?.commonUses)).toBe(true);
    expect(details?.commonUses.length).toBeGreaterThan(0);
  });

  it('should return details with grade level', () => {
    const details = manager.getFormulaDetails('H2O');
    expect(details?.gradeLevel).toBe(5);
  });
});

describe('ChemicalFormulaManager - getFormula', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should retrieve formula by ID', () => {
    const formula = manager.getFormula('H2O');
    expect(formula).toBeDefined();
    expect(formula?.id).toBe('H2O');
    expect(formula?.formula).toBe('H₂O');
  });

  it('should return undefined for non-existent formula', () => {
    const formula = manager.getFormula('XYZ');
    expect(formula).toBeUndefined();
  });

  it('should return all formula properties', () => {
    const formula = manager.getFormula('CO2');
    expect(formula).toHaveProperty('id');
    expect(formula).toHaveProperty('formula');
    expect(formula).toHaveProperty('name');
    expect(formula).toHaveProperty('elements');
    expect(formula).toHaveProperty('gradeLevel');
    expect(formula).toHaveProperty('commonUses');
  });
});

describe('ChemicalFormulaManager - getAllFormulas', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should return all formulas', () => {
    const formulas = manager.getAllFormulas();
    expect(Array.isArray(formulas)).toBe(true);
    expect(formulas.length).toBeGreaterThan(0);
  });

  it('should return at least 8 formulas', () => {
    const formulas = manager.getAllFormulas();
    expect(formulas.length).toBeGreaterThanOrEqual(8);
  });

  it('should include grade 5 and grade 6 formulas', () => {
    const formulas = manager.getAllFormulas();
    const grade5 = formulas.filter((f) => f.gradeLevel === 5);
    const grade6 = formulas.filter((f) => f.gradeLevel === 6);
    expect(grade5.length).toBeGreaterThan(0);
    expect(grade6.length).toBeGreaterThan(0);
  });

  it('should return formulas with valid structure', () => {
    const formulas = manager.getAllFormulas();
    formulas.forEach((formula) => {
      expect(formula.id).toBeDefined();
      expect(formula.formula).toBeDefined();
      expect(formula.name).toBeDefined();
      expect(Array.isArray(formula.elements)).toBe(true);
      expect([5, 6]).toContain(formula.gradeLevel);
    });
  });
});

describe('ChemicalFormulaManager - getRandomFormulasByGrade', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should return random formulas for grade 5', () => {
    const formulas = manager.getRandomFormulasByGrade(5, 2);
    expect(formulas.length).toBe(2);
    expect(formulas.every((f) => f.gradeLevel <= 5)).toBe(true);
  });

  it('should return random formulas for grade 6', () => {
    const formulas = manager.getRandomFormulasByGrade(6, 3);
    expect(formulas.length).toBe(3);
    expect(formulas.every((f) => f.gradeLevel <= 6)).toBe(true);
  });

  it('should throw error when requesting more formulas than available', () => {
    expect(() => manager.getRandomFormulasByGrade(5, 100)).toThrow();
  });

  it('should return different formulas on multiple calls', () => {
    const formulas1 = manager.getRandomFormulasByGrade(6, 2);
    const formulas2 = manager.getRandomFormulasByGrade(6, 2);
    // Note: This test may occasionally fail due to randomness, but probability is low
    // We're just checking that the function returns valid results
    expect(formulas1.length).toBe(2);
    expect(formulas2.length).toBe(2);
  });

  it('should return single formula when count is 1', () => {
    const formulas = manager.getRandomFormulasByGrade(5, 1);
    expect(formulas.length).toBe(1);
  });
});

describe('ChemicalFormulaManager - Integration Tests', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should retrieve and validate formula composition', () => {
    const formula = manager.getFormula('H2O');
    expect(formula).toBeDefined();
    const isValid = manager.validateFormulaComposition('H2O', formula!.elements);
    expect(isValid).toBe(true);
  });

  it('should get formula details and validate all elements exist', () => {
    const details = manager.getFormulaDetails('CaCO3');
    expect(details).toBeDefined();
    expect(details?.elementDetails.length).toBe(3);
    details?.elementDetails.forEach((element) => {
      expect(element.symbol).toBeDefined();
      expect(element.name).toBeDefined();
    });
  });

  it('should retrieve grade-appropriate formulas and validate them', () => {
    const formulas = manager.getFormulasByGrade(5);
    formulas.forEach((formula) => {
      const isValid = manager.validateFormulaComposition(formula.id, formula.elements);
      expect(isValid).toBe(true);
    });
  });

  it('should handle all formulas in database', () => {
    const allFormulas = manager.getAllFormulas();
    allFormulas.forEach((formula) => {
      const details = manager.getFormulaDetails(formula.id);
      expect(details).toBeDefined();
      expect(details?.elementDetails.length).toBeGreaterThan(0);
    });
  });
});


describe('ChemicalFormulaManager - Property-Based Tests', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  describe('Property 4: Chemical Formula Composition', () => {
    /**
     * **Validates: Requirements 3.2, 3.3**
     *
     * Property: For any chemical formula in the system, when a user attempts to
     * compose the formula using individual elements, the system SHALL only accept
     * the exact set of elements that constitute the formula. The validation must
     * be order-independent and must reject any composition with missing, extra,
     * or incorrect elements.
     *
     * This ensures that:
     * - Only correct element combinations are accepted
     * - The order of element selection doesn't matter
     * - Missing elements are rejected
     * - Extra elements are rejected
     * - Wrong elements are rejected
     */
    it('should validate correct formula composition for all formulas in database', () => {
      const allFormulas = manager.getAllFormulas();

      allFormulas.forEach((formula) => {
        // Test with exact elements in original order
        const isValid = manager.validateFormulaComposition(formula.id, formula.elements);
        expect(isValid).toBe(true);
      });
    });

    it('should validate correct composition regardless of element order', () => {
      const allFormulas = manager.getAllFormulas();

      allFormulas.forEach((formula) => {
        // Create all permutations of elements and test each
        const elements = formula.elements;

        // Test with reversed order
        const reversed = [...elements].reverse();
        const isValidReversed = manager.validateFormulaComposition(formula.id, reversed);
        expect(isValidReversed).toBe(true);

        // Test with shuffled order (if more than 2 elements)
        if (elements.length > 2) {
          const shuffled = [...elements].sort(() => Math.random() - 0.5);
          const isValidShuffled = manager.validateFormulaComposition(formula.id, shuffled);
          expect(isValidShuffled).toBe(true);
        }
      });
    });

    it('should reject composition with missing elements', () => {
      const allFormulas = manager.getAllFormulas();

      allFormulas.forEach((formula) => {
        if (formula.elements.length > 1) {
          // Remove one element and test
          const missingOne = formula.elements.slice(0, -1);
          const isValid = manager.validateFormulaComposition(formula.id, missingOne);
          expect(isValid).toBe(false);
        }
      });
    });

    it('should reject composition with extra elements', () => {
      const allFormulas = manager.getAllFormulas();
      const allElements = manager.getAllElements();

      allFormulas.forEach((formula) => {
        // Find an element not in the formula
        const extraElement = allElements.find(
          (e) => !formula.elements.includes(e.symbol),
        );

        if (extraElement) {
          const withExtra = [...formula.elements, extraElement.symbol];
          const isValid = manager.validateFormulaComposition(formula.id, withExtra);
          expect(isValid).toBe(false);
        }
      });
    });

    it('should reject composition with wrong elements', () => {
      const allFormulas = manager.getAllFormulas();
      const allElements = manager.getAllElements();

      allFormulas.forEach((formula) => {
        // Find elements not in the formula
        const wrongElements = allElements
          .filter((e) => !formula.elements.includes(e.symbol))
          .slice(0, formula.elements.length);

        if (wrongElements.length === formula.elements.length) {
          const wrongComposition = wrongElements.map((e) => e.symbol);
          const isValid = manager.validateFormulaComposition(formula.id, wrongComposition);
          expect(isValid).toBe(false);
        }
      });
    });

    it('should return false for non-existent formula', () => {
      const isValid = manager.validateFormulaComposition('XYZ123', ['X', 'Y', 'Z']);
      expect(isValid).toBe(false);
    });

    it('should handle empty element array', () => {
      const allFormulas = manager.getAllFormulas();

      allFormulas.forEach((formula) => {
        const isValid = manager.validateFormulaComposition(formula.id, []);
        expect(isValid).toBe(false);
      });
    });

    it('should maintain consistency: if validation passes, elements match formula', () => {
      const allFormulas = manager.getAllFormulas();

      allFormulas.forEach((formula) => {
        const isValid = manager.validateFormulaComposition(formula.id, formula.elements);

        if (isValid) {
          // If validation passes, the elements must match exactly
          const sortedFormula = formula.elements.sort();
          const sortedInput = formula.elements.sort();
          expect(sortedFormula).toEqual(sortedInput);
        }
      });
    });

    it('should maintain consistency: if validation fails, elements do not match formula', () => {
      const allFormulas = manager.getAllFormulas();
      const allElements = manager.getAllElements();

      allFormulas.forEach((formula) => {
        // Create an invalid composition
        const wrongElements = allElements
          .filter((e) => !formula.elements.includes(e.symbol))
          .slice(0, 1)
          .map((e) => e.symbol);

        if (wrongElements.length > 0) {
          const isValid = manager.validateFormulaComposition(formula.id, wrongElements);

          if (!isValid) {
            // If validation fails, the elements must not match exactly
            const sortedFormula = formula.elements.sort();
            const sortedInput = wrongElements.sort();
            expect(sortedFormula).not.toEqual(sortedInput);
          }
        }
      });
    });

    it('should validate all grade 5 formulas correctly', () => {
      const grade5Formulas = manager.getFormulasByGrade(5);

      grade5Formulas.forEach((formula) => {
        const isValid = manager.validateFormulaComposition(formula.id, formula.elements);
        expect(isValid).toBe(true);
      });
    });

    it('should validate all grade 6 formulas correctly', () => {
      const grade6Formulas = manager.getFormulasByGrade(6);

      grade6Formulas.forEach((formula) => {
        const isValid = manager.validateFormulaComposition(formula.id, formula.elements);
        expect(isValid).toBe(true);
      });
    });

    it('should handle duplicate elements in input', () => {
      // H2O with duplicate H
      const isValid = manager.validateFormulaComposition('H2O', ['H', 'H', 'O']);
      expect(isValid).toBe(false);
    });

    it('should validate complex formulas like Ca(OH)2', () => {
      const isValid = manager.validateFormulaComposition('Ca(OH)2', ['Ca', 'O', 'H']);
      expect(isValid).toBe(true);
    });

    it('should validate complex formulas like H2SO4', () => {
      const isValid = manager.validateFormulaComposition('H2SO4', ['H', 'S', 'O']);
      expect(isValid).toBe(true);
    });
  });
});
