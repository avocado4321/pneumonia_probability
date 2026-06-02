import {
  likelihoodRatioNegative,
  likelihoodRatioPositive
} from './bayes.js';

export const SOURCES = {
  cxr: {
    short: 'Pediatric imaging meta-analyses; conservative CXR LR values selected for v0.1.',
    detail:
      'CXR performance varies by reference standard and reader. This calculator uses conservative rounded values near sensitivity 0.90 and specificity 0.91 rather than the most optimistic pooled estimates.'
  },
  biomarkers: {
    short: 'Gunaratnam et al. 2021 pediatric biomarker systematic review/meta-analysis.',
    detail:
      'CRP and procalcitonin had modest discrimination for bacterial vs nonbacterial pneumonia; WBC performed poorly. These biomarkers should not be used alone.'
  },
  guideline: {
    short: 'PIDS/IDSA pediatric CAP guideline recommendations on diagnostic testing.',
    detail:
      'CBC and acute phase reactants are adjunctive. Viral testing and Mycoplasma testing can modify clinical decision-making, but results must be interpreted with clinical/radiographic context and coinfection risk.'
  },
  pathogenCaveat: {
    short: 'Respiratory PCR pathogen detection does not always prove lower-airway causality.',
    detail:
      'Upper-airway PCR may detect colonization, prolonged shedding, or codetection. Respiratory pathogen panel effects are therefore displayed as interpretation by default; numeric heuristic adjustment is optional.'
  }
};

const pctSensitivity = 0.69;
const pctSpecificity = 0.64;
const crpSensitivity = 0.70;
const crpSpecificity = 0.64;
const wbcSensitivity = 0.63;
const wbcSpecificity = 0.48;
const ancSensitivity = 0.48;
const ancSpecificity = 0.88;

export const THRESHOLDS = {
  pct: {
    threshold: 0.59,
    unit: 'ng/mL',
    sensitivity: pctSensitivity,
    specificity: pctSpecificity,
    lrPositive: likelihoodRatioPositive(pctSensitivity, pctSpecificity),
    lrNegative: likelihoodRatioNegative(pctSensitivity, pctSpecificity),
    source: SOURCES.biomarkers
  },
  crp: {
    threshold: 53,
    unit: 'mg/L',
    sensitivity: crpSensitivity,
    specificity: crpSpecificity,
    lrPositive: likelihoodRatioPositive(crpSensitivity, crpSpecificity),
    lrNegative: likelihoodRatioNegative(crpSensitivity, crpSpecificity),
    source: SOURCES.biomarkers
  },
  wbc: {
    threshold: 13,
    unit: 'x10^9/L',
    sensitivity: wbcSensitivity,
    specificity: wbcSpecificity,
    lrPositive: likelihoodRatioPositive(wbcSensitivity, wbcSpecificity),
    lrNegative: likelihoodRatioNegative(wbcSensitivity, wbcSpecificity),
    source: SOURCES.biomarkers
  },
  anc: {
    threshold: 10,
    unit: 'x10^9/L',
    sensitivity: ancSensitivity,
    specificity: ancSpecificity,
    lrPositive: likelihoodRatioPositive(ancSensitivity, ancSpecificity),
    lrNegative: likelihoodRatioNegative(ancSensitivity, ancSpecificity),
    source: {
      short: 'Limited ANC threshold from pediatric biomarker literature; not a pooled default-quality estimate.',
      detail:
        'ANC >=10 x10^9/L is treated as an exploratory CBC differential signal. The numeric LR is included for visualization and should be interpreted cautiously.'
    }
  }
};

export const CXR_OPTIONS = {
  not_done: {
    key: 'not_done',
    label: 'Not done / do not apply CXR',
    resultLabel: 'CXR not applied',
    lr: 1,
    sensitivity: null,
    specificity: null,
    evidenceQuality: 'none',
    note: 'No imaging likelihood ratio is applied.'
  },
  positive: {
    key: 'positive',
    label: 'Positive: infiltrate/consolidation consistent with pneumonia',
    resultLabel: 'CXR positive',
    lr: 9.5,
    sensitivity: 0.90,
    specificity: 0.91,
    evidenceQuality: 'core',
    source: SOURCES.cxr,
    note: 'Conservative LR+ selected for pediatric pneumonia visualization.'
  },
  negative: {
    key: 'negative',
    label: 'Negative: no radiographic pneumonia',
    resultLabel: 'CXR negative',
    lr: 0.11,
    sensitivity: 0.90,
    specificity: 0.91,
    evidenceQuality: 'core',
    source: SOURCES.cxr,
    note: 'Conservative LR- selected for pediatric pneumonia visualization.'
  },
  equivocal: {
    key: 'equivocal',
    label: 'Equivocal / nonspecific / atelectasis vs infiltrate',
    resultLabel: 'CXR equivocal',
    lr: 1,
    sensitivity: null,
    specificity: null,
    evidenceQuality: 'uncertain',
    source: SOURCES.cxr,
    note: 'Equivocal imaging is modeled as no numeric probability change in v0.1.'
  }
};

export const RPP_OPTIONS = {
  not_done: {
    key: 'not_done',
    label: 'Not done',
    resultLabel: 'Respiratory panel not done',
    lr: 1,
    note: 'No pathogen-testing adjustment is applied.'
  },
  negative: {
    key: 'negative',
    label: 'Negative panel',
    resultLabel: 'Respiratory panel negative',
    lr: 1,
    note: 'A negative upper-airway panel does not rule out pneumonia or bacterial disease.'
  },
  viral_only: {
    key: 'viral_only',
    label: 'Viral pathogen detected only',
    resultLabel: 'Viral pathogen detected only',
    lr: 0.75,
    note:
      'Heuristic: viral-only detection can lower suspicion for bacterial/atypical disease if there are no clinical, laboratory, or radiographic signs of coinfection. It does not rule out bacterial coinfection.'
  },
  mycoplasma: {
    key: 'mycoplasma',
    label: 'Mycoplasma pneumoniae detected',
    resultLabel: 'Mycoplasma detected',
    lr: 2.0,
    note:
      'Heuristic: Mycoplasma detection supports atypical pneumonia in the right age/symptom context. PCR can also reflect carriage; codetections are common.'
  },
  pertussis: {
    key: 'pertussis',
    label: 'Bordetella pertussis or parapertussis detected',
    resultLabel: 'Pertussis/parapertussis detected',
    lr: 1.5,
    note:
      'Heuristic: detection identifies a clinically relevant pathogen but does not by itself prove radiographic pneumonia.'
  },
  mixed: {
    key: 'mixed',
    label: 'Mixed viral + atypical/bacterial detections',
    resultLabel: 'Mixed pathogen detections',
    lr: 1.2,
    note:
      'Heuristic: mixed detections are difficult to interpret. This small LR avoids overstating causality from upper-airway PCR.'
  }
};

export function numericResultToEvidence(testKey, rawValue) {
  const definition = THRESHOLDS[testKey];
  if (!definition) {
    throw new Error(`Unknown numeric test: ${testKey}`);
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value) || rawValue === '') {
    return null;
  }

  const isElevated = value >= definition.threshold;
  return {
    key: testKey,
    test: testLabel(testKey),
    result: `${value} ${definition.unit}`,
    resultLabel: isElevated
      ? `${testLabel(testKey)} elevated (>= ${definition.threshold} ${definition.unit})`
      : `${testLabel(testKey)} below threshold (< ${definition.threshold} ${definition.unit})`,
    lr: isElevated ? definition.lrPositive : definition.lrNegative,
    sensitivity: definition.sensitivity,
    specificity: definition.specificity,
    evidenceQuality: testKey === 'anc' ? 'limited' : 'adjunct',
    source: definition.source,
    note: isElevated
      ? `Applies LR+ for ${testLabel(testKey)} >= ${definition.threshold} ${definition.unit}.`
      : `Applies LR- for ${testLabel(testKey)} below ${definition.threshold} ${definition.unit}.`
  };
}

export function buildSelectedTestSteps(formState) {
  const steps = [];
  const cxr = CXR_OPTIONS[formState.cxrResult] || CXR_OPTIONS.not_done;
  if (cxr.key !== 'not_done') {
    steps.push({
      key: 'cxr',
      test: 'Chest radiograph',
      resultLabel: cxr.resultLabel,
      lr: cxr.lr,
      sensitivity: cxr.sensitivity,
      specificity: cxr.specificity,
      evidenceQuality: cxr.evidenceQuality,
      source: cxr.source,
      note: cxr.note
    });
  }

  for (const key of ['pct', 'wbc', 'anc', 'crp']) {
    const step = numericResultToEvidence(key, formState[key]);
    if (step) steps.push(step);
  }

  const rpp = RPP_OPTIONS[formState.rppResult] || RPP_OPTIONS.not_done;
  if (rpp.key !== 'not_done') {
    steps.push({
      key: 'rpp',
      test: 'Respiratory pathogen testing',
      resultLabel: rpp.resultLabel,
      lr: formState.includeRppHeuristic ? rpp.lr : 1,
      sensitivity: null,
      specificity: null,
      evidenceQuality: formState.includeRppHeuristic ? 'heuristic' : 'interpretation only',
      source: SOURCES.pathogenCaveat,
      note: formState.includeRppHeuristic
        ? rpp.note
        : `${rpp.note} Numeric pathogen adjustment is off by default in v0.1.`
    });
  }

  return steps;
}

export function testLabel(testKey) {
  return {
    pct: 'Procalcitonin',
    wbc: 'WBC',
    anc: 'ANC',
    crp: 'CRP'
  }[testKey] || testKey;
}

export const DEFAULT_FORM_STATE = {
  pretestProbabilityPercent: 20,
  cxrResult: 'not_done',
  pct: '',
  wbc: '',
  anc: '',
  crp: '',
  rppResult: 'not_done',
  includeRppHeuristic: false
};

export function modelWarnings(formState) {
  const warnings = [];
  const labsEntered = ['pct', 'wbc', 'anc', 'crp'].filter((key) => formState[key] !== '' && Number.isFinite(Number(formState[key])));

  if (labsEntered.length >= 2) {
    warnings.push(
      'Multiple inflammatory markers are correlated. Sequential multiplication may overstate certainty; interpret the combined result as educational rather than validated prediction.'
    );
  }

  if (formState.rppResult !== 'not_done' && !formState.includeRppHeuristic) {
    warnings.push(
      'Respiratory pathogen testing is included as interpretation only. Turn on the heuristic toggle only if you want a sensitivity-analysis adjustment.'
    );
  }

  if (formState.cxrResult === 'equivocal') {
    warnings.push('Equivocal CXR is modeled as LR 1.0 in v0.1 because published categories are not standardized.');
  }

  return warnings;
}
