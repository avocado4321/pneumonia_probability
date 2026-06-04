import {
  applyLikelihoodRatio,
  formatLikelihoodRatio,
  formatPercent,
  probabilityToOdds
} from './bayes.js';

const yTop = 120;
const yBottom = 518;
const yRange = yBottom - yTop;
const xPretest = 170;
const xLr = 430;
const xPosttest = 700;

const elements = {
  pretest: document.getElementById('nomogramPretest'),
  pretestOutput: document.getElementById('nomogramPretestOutput'),
  lr: document.getElementById('nomogramLr'),
  lrOutput: document.getElementById('nomogramLrOutput'),
  heroPretest: document.getElementById('heroPretest'),
  heroPosttest: document.getElementById('heroPosttest'),
  workedExampleText: document.getElementById('workedExampleText'),
  pretestOddsOutput: document.getElementById('pretestOddsOutput'),
  posttestOddsOutput: document.getElementById('posttestOddsOutput'),
  posttestProbabilityOutput: document.getElementById('posttestProbabilityOutput'),
  line: document.getElementById('nomogramLine'),
  pretestPoint: document.getElementById('pretestPoint'),
  lrPoint: document.getElementById('lrPoint'),
  posttestPoint: document.getElementById('posttestPoint'),
  pretestLabel: document.getElementById('pretestLabel'),
  lrLabel: document.getElementById('lrLabel'),
  posttestLabel: document.getElementById('posttestLabel'),
  caption: document.getElementById('nomogramCaption')
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function probabilityToNomogramY(probabilityPercent) {
  const p = clamp(Number(probabilityPercent) / 100, 0.001, 0.999);
  const logit = Math.log10(p / (1 - p));
  const minLogit = Math.log10(0.001 / 0.999);
  const maxLogit = Math.log10(0.999 / 0.001);
  const normalized = (logit - minLogit) / (maxLogit - minLogit);
  return yBottom - normalized * yRange;
}

function likelihoodRatioToNomogramY(lr) {
  const logLr = Math.log10(clamp(Number(lr), 0.01, 100));
  const normalized = (logLr - -2) / 4;
  return yBottom - normalized * yRange;
}

function formatOdds(odds) {
  if (odds >= 100) return odds.toFixed(0);
  if (odds >= 10) return odds.toFixed(1);
  if (odds >= 1) return odds.toFixed(2);
  return odds.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function updateNomogram() {
  const pretestPercent = Number(elements.pretest.value);
  const pretestProbability = pretestPercent / 100;
  const likelihoodRatio = Math.pow(10, Number(elements.lr.value));
  const posttestProbability = applyLikelihoodRatio(pretestProbability, likelihoodRatio);
  const pretestOdds = probabilityToOdds(pretestProbability);
  const posttestOdds = pretestOdds * likelihoodRatio;

  const pretestY = probabilityToNomogramY(pretestPercent);
  const lrY = likelihoodRatioToNomogramY(likelihoodRatio);
  const posttestY = probabilityToNomogramY(posttestProbability * 100);

  const pretestText = `${pretestPercent}%`;
  const lrText = formatLikelihoodRatio(likelihoodRatio);
  const posttestText = formatPercent(posttestProbability);

  elements.pretestOutput.textContent = pretestText;
  elements.pretestOutput.value = pretestText;
  elements.lrOutput.textContent = lrText;
  elements.lrOutput.value = lrText;
  elements.heroPretest.textContent = pretestText;
  elements.heroPosttest.textContent = posttestText;
  elements.pretestOddsOutput.textContent = formatOdds(pretestOdds);
  elements.posttestOddsOutput.textContent = formatOdds(posttestOdds);
  elements.posttestProbabilityOutput.textContent = posttestText;

  elements.line.setAttribute('points', `${xPretest},${pretestY.toFixed(1)} ${xLr},${lrY.toFixed(1)} ${xPosttest},${posttestY.toFixed(1)}`);
  elements.pretestPoint.setAttribute('cy', pretestY.toFixed(1));
  elements.lrPoint.setAttribute('cy', lrY.toFixed(1));
  elements.posttestPoint.setAttribute('cy', posttestY.toFixed(1));

  elements.pretestLabel.textContent = pretestText;
  elements.lrLabel.textContent = `LR ${lrText}`;
  elements.posttestLabel.textContent = posttestText;
  elements.pretestLabel.setAttribute('y', (pretestY - 10).toFixed(1));
  elements.lrLabel.setAttribute('y', (lrY - 16).toFixed(1));
  elements.posttestLabel.setAttribute('y', (posttestY - 10).toFixed(1));
  elements.caption.textContent = `${pretestText} pre-test probability × LR ${lrText} → ${posttestText} post-test probability`;

  elements.workedExampleText.textContent = `If the bedside pre-test probability is ${pretestText}, the pre-test odds are ${formatOdds(pretestOdds)}. A likelihood ratio of ${lrText} gives post-test odds of ${formatOdds(posttestOdds)} and a post-test probability of ${posttestText}.`;
}

for (const element of [elements.pretest, elements.lr]) {
  element.addEventListener('input', updateNomogram);
  element.addEventListener('change', updateNomogram);
}

updateNomogram();
