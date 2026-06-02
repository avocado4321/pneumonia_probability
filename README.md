# Pediatric Pneumonia Bayesian Probability Calculator

Static educational prototype for visualizing how test results update a clinician-estimated pre-test probability of pediatric pneumonia using Bayes' theorem.

## Status

Version: `0.1.0`

This is a first working version. It is intended for education, model review, and iterative development. It is not validated for patient-level diagnosis or treatment decisions.

## Included inputs

- Clinician pre-test probability slider
- Chest radiograph: positive, negative, equivocal, or not applied
- Procalcitonin, in ng/mL
- WBC, in x10^9/L
- ANC, in x10^9/L
- CRP, in mg/L
- Respiratory pathogen testing, including viral pathogens, Mycoplasma pneumoniae, Bordetella pertussis, and Bordetella parapertussis

## How the calculator works

The model converts pre-test probability to odds, multiplies by a likelihood ratio, and converts odds back to probability.

```text
pretest odds = pretest probability / (1 - pretest probability)
posttest odds = pretest odds * likelihood ratio
posttest probability = posttest odds / (1 + posttest odds)
```

When multiple tests are selected, the prototype applies them sequentially. This is mathematically transparent but clinically imperfect because inflammatory markers are correlated. The app displays a warning when multiple inflammatory markers are entered.

## Evidence constants in v0.1

| Input | Threshold/result | LR used | Evidence note |
|---|---:|---:|---|
| Chest radiograph positive | infiltrate/consolidation | 9.5 | Conservative pediatric imaging value |
| Chest radiograph negative | no radiographic pneumonia | 0.11 | Conservative pediatric imaging value |
| Chest radiograph equivocal | nonspecific | 1.0 | No numeric adjustment |
| Procalcitonin elevated | >=0.59 ng/mL | 1.92 | Pediatric biomarker meta-analysis; bacterial vs nonbacterial target |
| Procalcitonin below threshold | <0.59 ng/mL | 0.48 | Same source |
| CRP elevated | >=53 mg/L | 1.94 | Pediatric biomarker meta-analysis; bacterial vs nonbacterial target |
| CRP below threshold | <53 mg/L | 0.47 | Same source |
| WBC elevated | >=13 x10^9/L | 1.21 | Pediatric biomarker meta-analysis; weak discriminator |
| WBC below threshold | <13 x10^9/L | 0.77 | Same source |
| ANC elevated | >=10 x10^9/L | 4.00 | Limited single-threshold CBC differential estimate |
| ANC below threshold | <10 x10^9/L | 0.59 | Limited estimate |
| Respiratory pathogen panel | selected result | 1.0 by default | Interpretation-only by default |

Respiratory pathogen testing has an optional heuristic toggle. It is off by default because upper-airway PCR can detect colonization, prolonged shedding, or codetection rather than causality.

## Run locally

No build system is required.

```bash
cd pediatric-pneumonia-calculator
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

## Run checks

```bash
npm test
```

The test suite verifies odds conversion, Bayesian updating, LR derivation from sensitivity/specificity, threshold classification, respiratory-pathogen heuristic behavior, and sequential update arithmetic.

## GitHub Pages deployment

Because this is a static site, it can be hosted from the repository root or a `docs/` folder. Recommended repository settings:

1. Push this folder to a GitHub repository.
2. Go to Settings -> Pages.
3. Select Deploy from branch.
4. Select branch `main` and folder `/root`.
5. Save.

## Important limitations

- The app is not medical advice and is not validated as a clinical decision support tool.
- It does not account for age-specific baseline prevalence, local epidemiology, vaccination status, prior antibiotics, symptom duration, hypoxemia, focal exam findings, chronic disease, or immune status.
- Chest radiograph evidence is affected by reference-standard bias and interobserver variability.
- CRP, procalcitonin, WBC, and ANC do not reliably distinguish viral from bacterial CAP when used alone.
- Sequential multiplication of correlated biomarkers can overstate certainty.
- Respiratory pathogen panel results require clinical context and do not necessarily prove lower-airway causality.

## Source files

- `src/bayes.js`: probability and likelihood-ratio math
- `src/evidence.js`: thresholds, LRs, and evidence notes
- `src/app.js`: UI behavior
- `tests/test-bayes.mjs`: calculation checks
- `docs/evidence-methods.md`: evidence selection notes
- `docs/model-notes.md`: modeling cautions and next steps
