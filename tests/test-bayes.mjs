import assert from 'node:assert/strict';
import {
  applyLikelihoodRatio,
  likelihoodRatioNegative,
  likelihoodRatioPositive,
  probabilityToOdds,
  oddsToProbability,
  runSequentialUpdate
} from '../src/bayes.js';
import {
  buildSelectedTestSteps,
  CXR_OPTIONS,
  DEFAULT_FORM_STATE,
  numericResultToEvidence,
  RPP_OPTIONS,
  THRESHOLDS
} from '../src/evidence.js';

const nearly = (actual, expected, tolerance = 1e-6) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`
  );
};

// Basic odds conversions.
nearly(probabilityToOdds(0.2), 0.25);
nearly(oddsToProbability(0.25), 0.2);

// Bayesian update: 20% pretest probability with LR 10 yields 71.4286% post-test probability.
nearly(applyLikelihoodRatio(0.2, 10), 0.7142857142857143);

// Conservative CXR checks.
nearly(applyLikelihoodRatio(0.2, CXR_OPTIONS.positive.lr), 0.7037037037037037);
nearly(applyLikelihoodRatio(0.2, CXR_OPTIONS.negative.lr), 0.0267639902676399);

// LR derivation checks from sensitivity/specificity.
nearly(likelihoodRatioPositive(0.69, 0.64), THRESHOLDS.pct.lrPositive);
nearly(likelihoodRatioNegative(0.69, 0.64), THRESHOLDS.pct.lrNegative);
nearly(THRESHOLDS.pct.lrPositive, 1.9166666666666667);
nearly(THRESHOLDS.pct.lrNegative, 0.484375);

nearly(THRESHOLDS.crp.lrPositive, 1.9444444444444446);
nearly(THRESHOLDS.crp.lrNegative, 0.46875);
nearly(THRESHOLDS.wbc.lrPositive, 1.2115384615384615);
nearly(THRESHOLDS.wbc.lrNegative, 0.7708333333333334);
nearly(THRESHOLDS.anc.lrPositive, 4);
nearly(THRESHOLDS.anc.lrNegative, 0.5909090909090909);

// Numeric threshold classification checks.
assert.equal(numericResultToEvidence('pct', '0.60').lr, THRESHOLDS.pct.lrPositive);
assert.equal(numericResultToEvidence('pct', '0.20').lr, THRESHOLDS.pct.lrNegative);
assert.equal(numericResultToEvidence('crp', '53').lr, THRESHOLDS.crp.lrPositive);
assert.equal(numericResultToEvidence('wbc', '12.9').lr, THRESHOLDS.wbc.lrNegative);
assert.equal(numericResultToEvidence('anc', '10').lr, THRESHOLDS.anc.lrPositive);
assert.equal(numericResultToEvidence('anc', ''), null);

// Respiratory pathogen panel is interpretation-only by default.
let steps = buildSelectedTestSteps({
  ...DEFAULT_FORM_STATE,
  rppResult: 'viral_only',
  includeRppHeuristic: false
});
assert.equal(steps.at(-1).lr, 1);

// Optional heuristic mode applies conservative RPP LR.
steps = buildSelectedTestSteps({
  ...DEFAULT_FORM_STATE,
  rppResult: 'viral_only',
  includeRppHeuristic: true
});
assert.equal(steps.at(-1).lr, RPP_OPTIONS.viral_only.lr);

// Sequential chain check.
const chain = runSequentialUpdate(0.2, [
  { test: 'CXR', lr: CXR_OPTIONS.positive.lr },
  { test: 'CRP', lr: THRESHOLDS.crp.lrPositive }
]);
const manualOdds = probabilityToOdds(0.2) * CXR_OPTIONS.positive.lr * THRESHOLDS.crp.lrPositive;
nearly(chain.posttestProbability, oddsToProbability(manualOdds));
assert.equal(chain.steps.length, 2);
assert.ok(chain.posttestProbability > chain.steps[0].after);

console.log('All Bayesian calculation checks passed.');
