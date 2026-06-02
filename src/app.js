import {
  formatLikelihoodRatio,
  formatPercent,
  runSequentialUpdate
} from './bayes.js';
import {
  buildSelectedTestSteps,
  DEFAULT_FORM_STATE,
  modelWarnings
} from './evidence.js';

const elements = {
  pretest: document.getElementById('pretest'),
  pretestOutput: document.getElementById('pretestOutput'),
  cxrResult: document.getElementById('cxrResult'),
  pct: document.getElementById('pct'),
  wbc: document.getElementById('wbc'),
  anc: document.getElementById('anc'),
  crp: document.getElementById('crp'),
  rppResult: document.getElementById('rppResult'),
  includeRppHeuristic: document.getElementById('includeRppHeuristic'),
  resetButton: document.getElementById('resetButton'),
  exampleButton: document.getElementById('exampleButton'),
  posttestProbability: document.getElementById('posttestProbability'),
  absoluteChange: document.getElementById('absoluteChange'),
  probabilityBar: document.getElementById('probabilityBar'),
  warnings: document.getElementById('warnings'),
  waterfall: document.getElementById('waterfall'),
  stepsTable: document.getElementById('stepsTable')
};

let state = { ...DEFAULT_FORM_STATE };

function readStateFromDom() {
  state = {
    pretestProbabilityPercent: Number(elements.pretest.value),
    cxrResult: elements.cxrResult.value,
    pct: elements.pct.value,
    wbc: elements.wbc.value,
    anc: elements.anc.value,
    crp: elements.crp.value,
    rppResult: elements.rppResult.value,
    includeRppHeuristic: elements.includeRppHeuristic.checked
  };
}

function writeStateToDom(nextState) {
  state = { ...state, ...nextState };
  elements.pretest.value = state.pretestProbabilityPercent;
  elements.pretestOutput.value = `${state.pretestProbabilityPercent}%`;
  elements.pretestOutput.textContent = `${state.pretestProbabilityPercent}%`;
  elements.cxrResult.value = state.cxrResult;
  elements.pct.value = state.pct;
  elements.wbc.value = state.wbc;
  elements.anc.value = state.anc;
  elements.crp.value = state.crp;
  elements.rppResult.value = state.rppResult;
  elements.includeRppHeuristic.checked = state.includeRppHeuristic;
}

function update() {
  readStateFromDom();
  elements.pretestOutput.value = `${state.pretestProbabilityPercent}%`;
  elements.pretestOutput.textContent = `${state.pretestProbabilityPercent}%`;

  const pretest = state.pretestProbabilityPercent / 100;
  const steps = buildSelectedTestSteps(state);
  const result = runSequentialUpdate(pretest, steps);

  renderSummary(pretest, result.posttestProbability);
  renderWarnings(modelWarnings(state));
  renderWaterfall(result);
  renderStepsTable(result.steps);
}

function renderSummary(pretest, posttest) {
  const delta = posttest - pretest;
  elements.posttestProbability.textContent = formatPercent(posttest);
  elements.absoluteChange.textContent = `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(1)}%`;
  elements.probabilityBar.style.width = `${Math.max(0, Math.min(100, posttest * 100))}%`;
}

function renderWarnings(warnings) {
  if (warnings.length === 0) {
    elements.warnings.innerHTML = '';
    return;
  }

  elements.warnings.innerHTML = warnings
    .map((warning) => `<div class="warning">${escapeHtml(warning)}</div>`)
    .join('');
}

function renderWaterfall(result) {
  const rows = [
    {
      label: 'Pre-test',
      sublabel: 'Clinician estimate',
      probability: result.pretestProbability
    },
    ...result.steps.map((step) => ({
      label: step.test,
      sublabel: `${step.resultLabel} | LR ${formatLikelihoodRatio(step.lr)}`,
      probability: step.after
    }))
  ];

  elements.waterfall.innerHTML = rows
    .map(
      (row) => `
        <div class="waterfall-row">
          <div>
            <strong>${escapeHtml(row.label)}</strong>
            <small>${escapeHtml(row.sublabel)}</small>
          </div>
          <div class="bar-shell"><div class="bar" style="width: ${Math.max(1, Math.min(100, row.probability * 100))}%"></div></div>
          <div><strong>${formatPercent(row.probability)}</strong></div>
        </div>
      `
    )
    .join('');
}

function renderStepsTable(steps) {
  if (steps.length === 0) {
    elements.stepsTable.innerHTML = `
      <tr>
        <td colspan="6">No tests applied. Select a CXR result, enter lab values, or add respiratory pathogen testing.</td>
      </tr>
    `;
    return;
  }

  elements.stepsTable.innerHTML = steps
    .map(
      (step, index) => `
        <tr>
          <td>${index + 1}. ${escapeHtml(step.test)}</td>
          <td>
            ${escapeHtml(step.resultLabel)}
            <span class="muted">${escapeHtml(step.note || '')}</span>
          </td>
          <td><strong>${formatLikelihoodRatio(step.lr)}</strong></td>
          <td>${formatPercent(step.before)}</td>
          <td>${formatPercent(step.after)}</td>
          <td>
            <span class="badge">${escapeHtml(step.evidenceQuality || 'unspecified')}</span>
            <span class="muted">${escapeHtml(step.source?.short || 'No source note')}</span>
          </td>
        </tr>
      `
    )
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function bindEvents() {
  for (const element of [
    elements.pretest,
    elements.cxrResult,
    elements.pct,
    elements.wbc,
    elements.anc,
    elements.crp,
    elements.rppResult,
    elements.includeRppHeuristic
  ]) {
    element.addEventListener('input', update);
    element.addEventListener('change', update);
  }

  elements.resetButton.addEventListener('click', () => {
    writeStateToDom({ ...DEFAULT_FORM_STATE });
    update();
  });

  elements.exampleButton.addEventListener('click', () => {
    writeStateToDom({
      pretestProbabilityPercent: 20,
      cxrResult: 'positive',
      pct: '0.8',
      wbc: '14',
      anc: '8',
      crp: '60',
      rppResult: 'viral_only',
      includeRppHeuristic: false
    });
    update();
  });
}

writeStateToDom({ ...DEFAULT_FORM_STATE });
bindEvents();
update();
