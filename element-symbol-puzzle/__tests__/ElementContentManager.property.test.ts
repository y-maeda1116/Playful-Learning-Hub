/**
 * Property-Based Tests for ElementContentManager
 * 
 * Tests universal properties that must hold across all inputs
 * using fast-check for property-based testing.
 */

import * as fc from 'fast-check';
import { ElementContentManager } from '../ElementContentManager';
import { ELEMENTS } from '../elements';

describe('ElementContentManager - Property-Based Tests', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  describe('Property 2: Grade-Appropriate Element Selection', () => {
    /**
     * **Validates: Requirements 1.1, 6.2**
     * 
     * Property: For any grade level (3, 4, 5, or 6), when elements are retrieved
     * for that grade, the system SHALL only return elements with gradeLevel <= the
     * requested grade.
     * 
     * This ensures that:
     * - Grade 3 students only see basic elements (15 elements)
     * - Grade 4 students see basic elements (15 elements)
     * - Grade 5 students see basic + intermediate elements (25 elements)
     * - Grade 6 students see all elements (30 elements)
     */
    it('should only return elements with gradeLevel <= requested grade', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(3 as const),
        fc.constant(4 as const),
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        const elements = manager.getElementsByGrade(grade);

        // All returned elements must have gradeLevel <= requested grade
        return elements.every((element) => element.gradeLevel <= grade);
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should return correct number of elements for each grade', () => {
      // Grade 3: 15 basic elements
      expect(manager.getElementsByGrade(3).length).toBe(15);

      // Grade 4: 15 basic elements (same as grade 3)
      expect(manager.getElementsByGrade(4).length).toBe(15);

      // Grade 5: 15 basic + 10 intermediate = 25 elements
      expect(manager.getElementsByGrade(5).length).toBe(25);

      // Grade 6: 15 basic + 10 intermediate + 5 advanced = 30 elements
      expect(manager.getElementsByGrade(6).length).toBe(30);
    });

    it('should maintain element consistency across grade levels', () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (grade) => {
          const elements = manager.getElementsByGrade(grade);
          const allElements = manager.getAllElements();

          // All returned elements must exist in the complete element database
          return elements.every((element) =>
            allElements.some((dbElement) => dbElement.id === element.id),
          );
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should have no duplicate elements in grade results', () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (grade) => {
          const elements = manager.getElementsByGrade(grade);
          const elementIds = elements.map((e) => e.id);
          const uniqueIds = new Set(elementIds);

          // No duplicates: set size should equal array length
          return uniqueIds.size === elementIds.length;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should maintain monotonic property: grade N includes all elements from grade N-1', () => {
      const grades = [3, 4, 5, 6] as const;

      for (let i = 1; i < grades.length; i++) {
        const prevGradeElements = manager.getElementsByGrade(grades[i - 1]);
        const currentGradeElements = manager.getElementsByGrade(grades[i]);

        const prevIds = new Set(prevGradeElements.map((e) => e.id));
        const currentIds = new Set(currentGradeElements.map((e) => e.id));

        // All elements from previous grade must be in current grade
        prevIds.forEach((id) => {
          expect(currentIds.has(id)).toBe(true);
        });
      }
    });

    it('should only contain valid grade levels in returned elements', () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (grade) => {
          const elements = manager.getElementsByGrade(grade);

          // All elements must have valid grade levels (3, 4, 5, or 6)
          return elements.every((element) => [3, 4, 5, 6].includes(element.gradeLevel));
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should have all required properties on returned elements', () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (grade) => {
          const elements = manager.getElementsByGrade(grade);

          return elements.every((element) => {
            // Check all required properties exist
            return (
              element.id !== undefined &&
              element.symbol !== undefined &&
              element.name !== undefined &&
              element.atomicNumber !== undefined &&
              element.atomicWeight !== undefined &&
              element.type !== undefined &&
              element.category !== undefined &&
              element.gradeLevel !== undefined &&
              element.pronunciation !== undefined &&
              element.audioUrl !== undefined &&
              element.commonUses !== undefined &&
              element.properties !== undefined &&
              element.periodicTablePosition !== undefined
            );
          });
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should throw error for invalid grade levels', () => {
      const invalidGrades = [1, 2, 7, 8, -1, 0, 100];

      invalidGrades.forEach((grade) => {
        expect(() => manager.getElementsByGrade(grade as any)).toThrow();
      });
    });
  });
});
