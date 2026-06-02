/**
 * Bayesian probability helpers.
 * All probabilities are represented as decimals from 0 to 1.
 */

export function clampProbability(probability) {
  const p = Number(probability);
  if (!Number.isFinite(p)) return 0.5;
  return Math.min(Math.max(p, 0.000001), 0.999999);
}

export function probabilityToOdds(probability) {
  const p = clampProbability(probability);
  return p / (1 - p);
}

export function oddsToProbability(odds) {
  const o = Number(odds);
  if (!Number.isFinite(o) || o < 0) {
    throw new Error(`Odds must be a finite non-negative number. Received: ${odds}`);
  }
  return o / (1 + o);
}

export function applyLikelihoodRatio(pretestProbability, likelihoodRatio) {
  const lr = Number(likelihoodRatio);
  if (!Number.isFinite(lr) || lr <= 0) {
    throw new Error(`Likelihood ratio must be a finite positive number. Received: ${likelihoodRatio}`);
  }
  return oddsToProbability(probabilityToOdds(pretestProbability) * lr);
}

export function likelihoodRatioPositive(sensitivity, specificity) {
  const sens = Number(sensitivity);
  const spec = Number(specificity);
  if (sens < 0 || sens > 1 || spec < 0 || spec >= 1) {
    throw new Error('LR+ requires sensitivity in [0,1] and specificity in [0,1).');
  }
  return sens / (1 - spec);
}

export function likelihoodRatioNegative(sensitivity, specificity) {
  const sens = Number(sensitivity);
  const spec = Number(specificity);
  if (sens < 0 || sens > 1 || spec <= 0 || spec > 1) {
    throw new Error('LR- requires sensitivity in [0,1] and specificity in (0,1].');
  }
  return (1 - sens) / spec;
}

export function positivePredictiveValue(pretestProbability, sensitivity, specificity) {
  const p = clampProbability(pretestProbability);
  const sens = Number(sensitivity);
  const spec = Number(specificity);
  const numerator = sens * p;
  const denominator = numerator + (1 - spec) * (1 - p);
  return denominator === 0 ? NaN : numerator / denominator;
}

export function negativePredictiveValue(pretestProbability, sensitivity, specificity) {
  const p = clampProbability(pretestProbability);
  const sens = Number(sensitivity);
  const spec = Number(specificity);
  const numerator = spec * (1 - p);
  const denominator = (1 - sens) * p + numerator;
  return denominator === 0 ? NaN : numerator / denominator;
}

export function runSequentialUpdate(pretestProbability, steps) {
  let probability = clampProbability(pretestProbability);
  const rows = [];

  for (const step of steps) {
    const before = probability;
    probability = applyLikelihoodRatio(probability, step.lr);
    rows.push({
      ...step,
      before,
      after: probability,
      delta: probability - before
    });
  }

  return {
    pretestProbability: clampProbability(pretestProbability),
    posttestProbability: probability,
    steps: rows
  };
}

export function formatPercent(probability, digits = 1) {
  const p = clampProbability(probability);
  return `${(p * 100).toFixed(digits)}%`;
}

export function formatLikelihoodRatio(lr) {
  const n = Number(lr);
  if (!Number.isFinite(n)) return 'n/a';
  if (n >= 10) return n.toFixed(1);
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(2);
}
