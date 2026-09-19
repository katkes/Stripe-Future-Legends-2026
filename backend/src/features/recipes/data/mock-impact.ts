import type { CostEstimate, EnvironmentalImpact, NutritionData } from '../models.js';

const COST_SOURCE = 'OpenBasket mock price table (Statistics Canada CPI food averages, 2026-03)';
const IMPACT_SOURCE = 'OpenBasket mock factors (Poore & Nemecek 2018; Agribalyse 3.1 ranges)';
const VERIFIED = '2026-03-15';

export function cad(minimum: number, maximum: number): CostEstimate {
  return { minimum, maximum, currency: 'CAD', source: COST_SOURCE, lastVerifiedAt: VERIFIED };
}

export function impact(carbonMin: number, carbonMax: number, waterMin: number, waterMax: number, level: EnvironmentalImpact['level']): EnvironmentalImpact {
  return {
    carbonKgCO2eMin: carbonMin,
    carbonKgCO2eMax: carbonMax,
    waterLitresMin: waterMin,
    waterLitresMax: waterMax,
    level,
    source: IMPACT_SOURCE,
    lastVerifiedAt: VERIFIED,
  };
}

export function nutrition(calories: number, proteinGrams: number, fibreGrams: number): NutritionData {
  return { calories, proteinGrams, fibreGrams };
}
