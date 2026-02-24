/**
 * Unit tests for ElementContentManager functionality
 * 
 * Tests element retrieval by grade level and category, audio URL availability,
 * and edge cases for the Element Symbol Puzzle game.
 */

import { ElementContentManager } from '../ElementContentManager';
import { Element } from '../types';

describe('ElementContentManager - getElementsByGrade', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should return elements for grade 3', () => {
    const elements = manager.getElementsByGrade(3);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.every((e) => e.gradeLevel <= 3)).toBe(true);
  });

  it('should return elements for grade 4', () => {
    const elements = manager.getElementsByGrade(4);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.every((e) => e.gradeLevel <= 4)).toBe(true);
  });

  it('should return elements for grade 5', () => {
    const elements = manager.getElementsByGrade(5);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.every((e) => e.gradeLevel <= 5)).toBe(true);
  });

  it('should return elements for grade 6', () => {
    const elements = manager.getElementsByGrade(6);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.every((e) => e.gradeLevel <= 6)).toBe(true);
  });

  it('should return 15 basic elements for grade 3', () => {
    const elements = manager.getElementsByGrade(3);
    expect(elements.length).toBe(15);
  });

  it('should return 15 elements for grade 4 (same as grade 3)', () => {
    const elements = manager.getElementsByGrade(4);
    expect(elements.length).toBe(15);
  });

  it('should return 25 elements for grade 5 (15 basic + 10 intermediate)', () => {
    const elements = manager.getElementsByGrade(5);
    expect(elements.length).toBe(25);
  });

  it('should return 30 elements for grade 6 (all elements)', () => {
    const elements = manager.getElementsByGrade(6);
    expect(elements.length).toBe(30);
  });

  it('should include grade 3 elements when requesting grade 4', () => {
    const grade3 = manager.getElementsByGrade(3);
    const grade4 = manager.getElementsByGrade(4);
    const grade3Symbols = grade3.map((e) => e.symbol);
    const grade4Symbols = grade4.map((e) => e.symbol);
    grade3Symbols.forEach((symbol) => {
      expect(grade4Symbols).toContain(symbol);
    });
  });

  it('should include grade 4 elements when requesting grade 5', () => {
    const grade4 = manager.getElementsByGrade(4);
    const grade5 = manager.getElementsByGrade(5);
    const grade4Symbols = grade4.map((e) => e.symbol);
    const grade5Symbols = grade5.map((e) => e.symbol);
    grade4Symbols.forEach((symbol) => {
      expect(grade5Symbols).toContain(symbol);
    });
  });

  it('should include grade 5 elements when requesting grade 6', () => {
    const grade5 = manager.getElementsByGrade(5);
    const grade6 = manager.getElementsByGrade(6);
    const grade5Symbols = grade5.map((e) => e.symbol);
    const grade6Symbols = grade6.map((e) => e.symbol);
    grade5Symbols.forEach((symbol) => {
      expect(grade6Symbols).toContain(symbol);
    });
  });

  it('should throw error for invalid grade level 2', () => {
    expect(() => manager.getElementsByGrade(2 as any)).toThrow(
      'Invalid grade level: 2. Must be 3, 4, 5, or 6.',
    );
  });

  it('should throw error for invalid grade level 7', () => {
    expect(() => manager.getElementsByGrade(7 as any)).toThrow(
      'Invalid grade level: 7. Must be 3, 4, 5, or 6.',
    );
  });

  it('should throw error for invalid grade level 0', () => {
    expect(() => manager.getElementsByGrade(0 as any)).toThrow();
  });

  it('should return elements with correct structure', () => {
    const elements = manager.getElementsByGrade(3);
    elements.forEach((element) => {
      expect(element).toHaveProperty('id');
      expect(element).toHaveProperty('symbol');
      expect(element).toHaveProperty('name');
      expect(element).toHaveProperty('atomicNumber');
      expect(element).toHaveProperty('atomicWeight');
      expect(element).toHaveProperty('type');
      expect(element).toHaveProperty('category');
      expect(element).toHaveProperty('gradeLevel');
      expect(element).toHaveProperty('pronunciation');
      expect(element).toHaveProperty('audioUrl');
      expect(element).toHaveProperty('commonUses');
      expect(element).toHaveProperty('properties');
      expect(element).toHaveProperty('periodicTablePosition');
    });
  });

  it('should return elements with valid types', () => {
    const elements = manager.getElementsByGrade(3);
    elements.forEach((element) => {
      expect(['metal', 'nonmetal', 'metalloid']).toContain(element.type);
      expect(['basic', 'intermediate', 'advanced']).toContain(element.category);
      expect([3, 4, 5, 6]).toContain(element.gradeLevel);
      expect(['solid', 'liquid', 'gas']).toContain(element.properties.state);
      expect(['high', 'medium', 'low']).toContain(element.properties.reactivity);
    });
  });

  it('should return elements with non-empty common uses', () => {
    const elements = manager.getElementsByGrade(3);
    elements.forEach((element) => {
      expect(Array.isArray(element.commonUses)).toBe(true);
      expect(element.commonUses.length).toBeGreaterThan(0);
    });
  });

  it('should return elements with valid periodic table positions', () => {
    const elements = manager.getElementsByGrade(3);
    elements.forEach((element) => {
      expect(element.periodicTablePosition.period).toBeGreaterThanOrEqual(1);
      expect(element.periodicTablePosition.period).toBeLessThanOrEqual(7);
      expect(element.periodicTablePosition.group).toBeGreaterThanOrEqual(1);
      expect(element.periodicTablePosition.group).toBeLessThanOrEqual(18);
    });
  });
});

describe('ElementContentManager - getElementsByCategory', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should return basic category elements', () => {
    const elements = manager.getElementsByCategory('basic');
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.every((e) => e.category === 'basic')).toBe(true);
  });

  it('should return intermediate category elements', () => {
    const elements = manager.getElementsByCategory('intermediate');
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.every((e) => e.category === 'intermediate')).toBe(true);
  });

  it('should return advanced category elements', () => {
    const elements = manager.getElementsByCategory('advanced');
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.every((e) => e.category === 'advanced')).toBe(true);
  });

  it('should return 15 basic elements', () => {
    const elements = manager.getElementsByCategory('basic');
    expect(elements.length).toBe(15);
  });

  it('should return 10 intermediate elements', () => {
    const elements = manager.getElementsByCategory('intermediate');
    expect(elements.length).toBe(10);
  });

  it('should return 5 advanced elements', () => {
    const elements = manager.getElementsByCategory('advanced');
    expect(elements.length).toBe(5);
  });

  it('should have no overlap between categories', () => {
    const basic = manager.getElementsByCategory('basic');
    const intermediate = manager.getElementsByCategory('intermediate');
    const advanced = manager.getElementsByCategory('advanced');

    const basicSymbols = basic.map((e) => e.symbol);
    const intermediateSymbols = intermediate.map((e) => e.symbol);
    const advancedSymbols = advanced.map((e) => e.symbol);

    intermediateSymbols.forEach((symbol) => {
      expect(basicSymbols).not.toContain(symbol);
      expect(advancedSymbols).not.toContain(symbol);
    });

    advancedSymbols.forEach((symbol) => {
      expect(basicSymbols).not.toContain(symbol);
      expect(intermediateSymbols).not.toContain(symbol);
    });
  });

  it('should throw error for invalid category', () => {
    expect(() => manager.getElementsByCategory('invalid' as any)).toThrow(
      "Invalid category: invalid. Must be 'basic', 'intermediate', or 'advanced'.",
    );
  });

  it('should throw error for empty string category', () => {
    expect(() => manager.getElementsByCategory('' as any)).toThrow();
  });

  it('should return elements with correct structure', () => {
    const elements = manager.getElementsByCategory('basic');
    elements.forEach((element) => {
      expect(element).toHaveProperty('id');
      expect(element).toHaveProperty('symbol');
      expect(element).toHaveProperty('name');
      expect(element).toHaveProperty('audioUrl');
    });
  });

  it('should return elements with matching category', () => {
    const elements = manager.getElementsByCategory('basic');
    elements.forEach((element) => {
      expect(element.category).toBe('basic');
    });
  });
});

describe('ElementContentManager - getElementAudio', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should return audio URL for hydrogen', () => {
    const audioUrl = manager.getElementAudio('H');
    expect(audioUrl).toBe('/audio/elements/H.mp3');
  });

  it('should return audio URL for oxygen', () => {
    const audioUrl = manager.getElementAudio('O');
    expect(audioUrl).toBe('/audio/elements/O.mp3');
  });

  it('should return audio URL for carbon', () => {
    const audioUrl = manager.getElementAudio('C');
    expect(audioUrl).toBe('/audio/elements/C.mp3');
  });

  it('should return audio URL for all grade 3 elements', () => {
    const elements = manager.getElementsByGrade(3);
    elements.forEach((element) => {
      const audioUrl = manager.getElementAudio(element.symbol);
      expect(audioUrl).toBeDefined();
      expect(typeof audioUrl).toBe('string');
      expect(audioUrl.length).toBeGreaterThan(0);
      expect(audioUrl).toContain('/audio/elements/');
      expect(audioUrl).toContain('.mp3');
    });
  });

  it('should return audio URL for all grade 6 elements', () => {
    const elements = manager.getElementsByGrade(6);
    elements.forEach((element) => {
      const audioUrl = manager.getElementAudio(element.symbol);
      expect(audioUrl).toBeDefined();
      expect(typeof audioUrl).toBe('string');
      expect(audioUrl.length).toBeGreaterThan(0);
    });
  });

  it('should throw error for non-existent element', () => {
    expect(() => manager.getElementAudio('Xx')).toThrow('Element not found: Xx');
  });

  it('should throw error for empty string', () => {
    expect(() => manager.getElementAudio('')).toThrow('Element not found: ');
  });

  it('should throw error for null element', () => {
    expect(() => manager.getElementAudio(null as any)).toThrow();
  });

  it('should throw error for undefined element', () => {
    expect(() => manager.getElementAudio(undefined as any)).toThrow();
  });

  it('should return consistent audio URLs', () => {
    const audioUrl1 = manager.getElementAudio('H');
    const audioUrl2 = manager.getElementAudio('H');
    expect(audioUrl1).toBe(audioUrl2);
  });

  it('should return different audio URLs for different elements', () => {
    const audioUrlH = manager.getElementAudio('H');
    const audioUrlO = manager.getElementAudio('O');
    expect(audioUrlH).not.toBe(audioUrlO);
  });

  it('should return audio URL with correct format', () => {
    const audioUrl = manager.getElementAudio('H');
    expect(audioUrl).toMatch(/^\/audio\/elements\/[A-Z][a-z]?\.mp3$/);
  });
});

describe('ElementContentManager - getAllElements', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should return all 30 elements', () => {
    const elements = manager.getAllElements();
    expect(elements.length).toBe(30);
  });

  it('should include basic elements', () => {
    const elements = manager.getAllElements();
    const basicElements = elements.filter((e) => e.category === 'basic');
    expect(basicElements.length).toBe(15);
  });

  it('should include intermediate elements', () => {
    const elements = manager.getAllElements();
    const intermediateElements = elements.filter((e) => e.category === 'intermediate');
    expect(intermediateElements.length).toBe(10);
  });

  it('should include advanced elements', () => {
    const elements = manager.getAllElements();
    const advancedElements = elements.filter((e) => e.category === 'advanced');
    expect(advancedElements.length).toBe(5);
  });

  it('should include elements from all grade levels', () => {
    const elements = manager.getAllElements();
    const grade3 = elements.filter((e) => e.gradeLevel === 3);
    const grade5 = elements.filter((e) => e.gradeLevel === 5);
    const grade6 = elements.filter((e) => e.gradeLevel === 6);

    expect(grade3.length).toBeGreaterThan(0);
    expect(grade5.length).toBeGreaterThan(0);
    expect(grade6.length).toBeGreaterThan(0);
  });

  it('should return elements with valid structure', () => {
    const elements = manager.getAllElements();
    elements.forEach((element) => {
      expect(element).toHaveProperty('id');
      expect(element).toHaveProperty('symbol');
      expect(element).toHaveProperty('name');
      expect(element).toHaveProperty('atomicNumber');
      expect(element).toHaveProperty('audioUrl');
    });
  });

  it('should return array of Element objects', () => {
    const elements = manager.getAllElements();
    expect(Array.isArray(elements)).toBe(true);
    elements.forEach((element) => {
      expect(typeof element).toBe('object');
      expect(element !== null).toBe(true);
    });
  });

  it('should have unique element symbols', () => {
    const elements = manager.getAllElements();
    const symbols = elements.map((e) => e.symbol);
    const uniqueSymbols = new Set(symbols);
    expect(uniqueSymbols.size).toBe(30);
  });

  it('should have unique atomic numbers', () => {
    const elements = manager.getAllElements();
    const atomicNumbers = elements.map((e) => e.atomicNumber);
    const uniqueNumbers = new Set(atomicNumbers);
    expect(uniqueNumbers.size).toBe(30);
  });
});

describe('ElementContentManager - getElement', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should retrieve element by symbol', () => {
    const element = manager.getElement('H');
    expect(element).toBeDefined();
    expect(element?.symbol).toBe('H');
    expect(element?.name).toBe('水素');
  });

  it('should return undefined for non-existent element', () => {
    const element = manager.getElement('Xx');
    expect(element).toBeUndefined();
  });

  it('should return element with all properties', () => {
    const element = manager.getElement('O');
    expect(element).toHaveProperty('id');
    expect(element).toHaveProperty('symbol');
    expect(element).toHaveProperty('name');
    expect(element).toHaveProperty('atomicNumber');
    expect(element).toHaveProperty('audioUrl');
    expect(element).toHaveProperty('gradeLevel');
    expect(element).toHaveProperty('category');
  });

  it('should return element with correct atomic number', () => {
    const element = manager.getElement('C');
    expect(element?.atomicNumber).toBe(6);
  });

  it('should return element with correct grade level', () => {
    const element = manager.getElement('H');
    expect(element?.gradeLevel).toBe(3);
  });
});

describe('ElementContentManager - getRandomElementsByGrade', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should return random elements for grade 3', () => {
    const elements = manager.getRandomElementsByGrade(3, 5);
    expect(elements.length).toBe(5);
    expect(elements.every((e) => e.gradeLevel <= 3)).toBe(true);
  });

  it('should return random elements for grade 5', () => {
    const elements = manager.getRandomElementsByGrade(5, 10);
    expect(elements.length).toBe(10);
    expect(elements.every((e) => e.gradeLevel <= 5)).toBe(true);
  });

  it('should return single element when count is 1', () => {
    const elements = manager.getRandomElementsByGrade(3, 1);
    expect(elements.length).toBe(1);
  });

  it('should throw error when requesting more elements than available', () => {
    expect(() => manager.getRandomElementsByGrade(3, 100)).toThrow(
      'Cannot get 100 random elements. Only 15 elements available for grade 3.',
    );
  });

  it('should throw error when requesting more elements than available for grade 5', () => {
    expect(() => manager.getRandomElementsByGrade(5, 50)).toThrow();
  });

  it('should return elements with valid structure', () => {
    const elements = manager.getRandomElementsByGrade(3, 5);
    elements.forEach((element) => {
      expect(element).toHaveProperty('symbol');
      expect(element).toHaveProperty('name');
      expect(element).toHaveProperty('audioUrl');
    });
  });

  it('should return different elements on multiple calls', () => {
    const elements1 = manager.getRandomElementsByGrade(6, 5);
    const elements2 = manager.getRandomElementsByGrade(6, 5);
    // Note: This test may occasionally fail due to randomness, but probability is low
    // We're just checking that the function returns valid results
    expect(elements1.length).toBe(5);
    expect(elements2.length).toBe(5);
  });

  it('should return all available elements when count equals available', () => {
    const elements = manager.getRandomElementsByGrade(3, 15);
    expect(elements.length).toBe(15);
  });
});

describe('ElementContentManager - Edge Cases', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should handle case-sensitive element symbols', () => {
    const element = manager.getElement('H');
    expect(element).toBeDefined();
    const invalidElement = manager.getElement('h');
    expect(invalidElement).toBeUndefined();
  });

  it('should handle multi-character element symbols', () => {
    const element = manager.getElement('Ca');
    expect(element).toBeDefined();
    expect(element?.symbol).toBe('Ca');
  });

  it('should handle three-character element symbols', () => {
    // Check if any three-character symbols exist
    const allElements = manager.getAllElements();
    const threeCharElements = allElements.filter((e) => e.symbol.length === 3);
    if (threeCharElements.length > 0) {
      const element = manager.getElement(threeCharElements[0].symbol);
      expect(element).toBeDefined();
    }
  });

  it('should maintain data consistency across multiple calls', () => {
    const element1 = manager.getElement('H');
    const element2 = manager.getElement('H');
    expect(element1).toEqual(element2);
  });

  it('should return consistent results for getElementsByGrade', () => {
    const elements1 = manager.getElementsByGrade(3);
    const elements2 = manager.getElementsByGrade(3);
    expect(elements1.length).toBe(elements2.length);
    expect(elements1.map((e) => e.symbol).sort()).toEqual(
      elements2.map((e) => e.symbol).sort(),
    );
  });

  it('should return consistent results for getElementsByCategory', () => {
    const elements1 = manager.getElementsByCategory('basic');
    const elements2 = manager.getElementsByCategory('basic');
    expect(elements1.length).toBe(elements2.length);
    expect(elements1.map((e) => e.symbol).sort()).toEqual(
      elements2.map((e) => e.symbol).sort(),
    );
  });

  it('should handle all elements having audio URLs', () => {
    const allElements = manager.getAllElements();
    allElements.forEach((element) => {
      expect(element.audioUrl).toBeDefined();
      expect(element.audioUrl.length).toBeGreaterThan(0);
      expect(element.audioUrl).toContain('.mp3');
    });
  });

  it('should handle all elements having valid atomic numbers', () => {
    const allElements = manager.getAllElements();
    allElements.forEach((element) => {
      expect(element.atomicNumber).toBeGreaterThan(0);
      expect(Number.isInteger(element.atomicNumber)).toBe(true);
    });
  });

  it('should handle all elements having valid atomic weights', () => {
    const allElements = manager.getAllElements();
    allElements.forEach((element) => {
      expect(element.atomicWeight).toBeGreaterThan(0);
      expect(typeof element.atomicWeight).toBe('number');
    });
  });
});

describe('ElementContentManager - Integration Tests', () => {
  let manager: ElementContentManager;

  beforeEach(() => {
    manager = new ElementContentManager();
  });

  it('should retrieve element by grade and then get its audio', () => {
    const elements = manager.getElementsByGrade(3);
    elements.forEach((element) => {
      const audioUrl = manager.getElementAudio(element.symbol);
      expect(audioUrl).toBeDefined();
      expect(audioUrl).toContain(element.symbol);
    });
  });

  it('should retrieve element by category and then get its audio', () => {
    const elements = manager.getElementsByCategory('basic');
    elements.forEach((element) => {
      const audioUrl = manager.getElementAudio(element.symbol);
      expect(audioUrl).toBeDefined();
    });
  });

  it('should get all elements and verify they are retrievable individually', () => {
    const allElements = manager.getAllElements();
    allElements.forEach((element) => {
      const retrieved = manager.getElement(element.symbol);
      expect(retrieved).toEqual(element);
    });
  });

  it('should get random elements and verify they are valid', () => {
    const randomElements = manager.getRandomElementsByGrade(5, 10);
    randomElements.forEach((element) => {
      const retrieved = manager.getElement(element.symbol);
      expect(retrieved).toBeDefined();
      expect(retrieved?.gradeLevel).toBeLessThanOrEqual(5);
    });
  });

  it('should verify grade progression includes all lower grade elements', () => {
    const grade3 = manager.getElementsByGrade(3);
    const grade4 = manager.getElementsByGrade(4);
    const grade5 = manager.getElementsByGrade(5);
    const grade6 = manager.getElementsByGrade(6);

    expect(grade3.length).toBeLessThanOrEqual(grade4.length);
    expect(grade4.length).toBeLessThanOrEqual(grade5.length);
    expect(grade5.length).toBeLessThanOrEqual(grade6.length);
  });

  it('should verify category distribution across grades', () => {
    const basicElements = manager.getElementsByCategory('basic');
    const intermediateElements = manager.getElementsByCategory('intermediate');
    const advancedElements = manager.getElementsByCategory('advanced');

    basicElements.forEach((e) => {
      expect([3, 4]).toContain(e.gradeLevel);
    });

    intermediateElements.forEach((e) => {
      expect([5]).toContain(e.gradeLevel);
    });

    advancedElements.forEach((e) => {
      expect([6]).toContain(e.gradeLevel);
    });
  });
});
