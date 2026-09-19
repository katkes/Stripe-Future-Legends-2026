import type { CostEstimate, EnvironmentalImpact, NutritionData } from '../models';

export function ImpactSummary({
  nutrition,
  cost,
  impact,
  servings,
}: {
  nutrition: NutritionData;
  cost: CostEstimate;
  impact: EnvironmentalImpact;
  servings: number;
}) {
  const perServing = ((cost.minimum + cost.maximum) / 2 / servings).toFixed(2);
  return (
    <section className="rf-impact">
      <h3>Nutrition, cost and impact</h3>
      <dl>
        <div><dt>Per serving</dt><dd>{nutrition.calories} kcal · {nutrition.proteinGrams}g protein · {nutrition.fibreGrams}g fibre</dd></div>
        <div>
          <dt>Estimated cost</dt>
          <dd>
            ${cost.minimum.toFixed(2)}–${cost.maximum.toFixed(2)} {cost.currency} total · ~${perServing}/serving
            <small>{cost.source}{cost.lastVerifiedAt ? ` · verified ${cost.lastVerifiedAt}` : ''}. Structured table — not model-generated.</small>
          </dd>
        </div>
        <div>
          <dt>Environmental range</dt>
          <dd>
            {impact.carbonKgCO2eMin}–{impact.carbonKgCO2eMax} kg CO₂e · {impact.waterLitresMin}–{impact.waterLitresMax} L water · {impact.level} impact
            <small>{impact.source}{impact.lastVerifiedAt ? ` · verified ${impact.lastVerifiedAt}` : ''}. Shown as a range because sources disagree.</small>
          </dd>
        </div>
      </dl>
    </section>
  );
}
