import { describe, it, expect } from 'vitest'

// ------------------------------------------------------------------
// THE LOGIC WE ARE TESTING
// (We copy the logic here to test it in isolation without DB connection)
// ------------------------------------------------------------------
function calculateWU(duration: number, difficulty: number, recall: number, resistance: number) {
    // 1. Base Math
    let wu = duration * difficulty * recall;
    
    // 2. The Resistance Bonus Rule (Triples score if resistance >= 8)
    if (resistance >= 8) {
        wu = wu * 3;
    }
    
    return Math.round(wu);
}

// ------------------------------------------------------------------
// THE TEST SUITE
// ------------------------------------------------------------------
describe('The Physics Engine (Nietzschean Math)', () => {
  
  it('Calculates Standard Session correctly', () => {
    // Scenario: 60 mins * Active(2) * Perfect Recall(1.0)
    // Expected: 120 WU
    const result = calculateWU(60, 2, 1.0, 0);
    expect(result).toBe(120);
  });

  it('Applies the Resistance Bonus correctly', () => {
    // Scenario: 30 mins * Active(2) * Perfect Recall(1.0)
    // Bonus: Resistance is 9 (High), so multiply by 3
    // Math: (30 * 2 * 1) * 3 = 180 WU
    const result = calculateWU(30, 2, 1.0, 9);
    expect(result).toBe(180);
  });

  it('Penalizes Hazy Recall correctly', () => {
    // Scenario: 60 mins * Active(2) * Bad Recall(0.5)
    // Math: 60 * 2 * 0.5 = 60 WU
    const result = calculateWU(60, 2, 0.5, 0);
    expect(result).toBe(60);
  });

  it('Handles Passive work correctly', () => {
    // Scenario: 45 mins * Passive(1) * Perfect Recall(1.0)
    // Math: 45 * 1 * 1 = 45 WU
    const result = calculateWU(45, 1, 1.0, 0);
    expect(result).toBe(45);
  });

});