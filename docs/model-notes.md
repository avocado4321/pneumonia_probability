# Model Notes and Next Steps

## Current model behavior

v0.1 applies every selected test sequentially:

1. Pre-test probability is converted to odds.
2. Each selected likelihood ratio is multiplied into the odds.
3. Final odds are converted back to probability.
4. Each step is displayed in the waterfall and evidence table.

## Why this is useful

This structure makes Bayesian reasoning visible. It helps demonstrate that a high-LR imaging test can move probability substantially, while inflammatory markers often move probability only modestly.

## Why this can mislead

The sequential model assumes conditional independence between tests. That assumption is not true for WBC, ANC, CRP, and procalcitonin. Combining all markers as if they were independent can overstate certainty.

## Recommended v0.2 improvements

1. Add a model mode selector:
   - Full sequential educational mode
   - Conservative mode: strongest biomarker only
   - Capped biomarker mode: combined biomarker LR cannot exceed a preset maximum
2. Add separate probability tracks:
   - Probability of radiographic/clinical pneumonia
   - Probability of bacterial or atypical etiology among suspected CAP
3. Add age strata:
   - 3 to 24 months
   - 2 to 5 years
   - 5 years and older
4. Add site-of-care context:
   - Outpatient/urgent care
   - Emergency department
   - Hospitalized
5. Add clinical features as optional inputs:
   - Hypoxemia
   - Increased work of breathing
   - Fever duration
   - Focal decreased breath sounds or crackles
   - Wheeze/bronchiolitis phenotype
6. Add sensitivity-analysis sliders for each LR.
7. Add downloadable evidence JSON.

## Candidate validation checks

Before any clinical use, the model would need validation against a pediatric dataset with:

- Explicit clinical pre-test assessment or enough clinical features to estimate it
- Standardized CXR interpretation
- Lab values with timestamps
- Respiratory pathogen panel results with platform/specimen type
- Final adjudicated diagnosis
- Outcomes such as antibiotic treatment, hospitalization, complicated pneumonia, and revisit/admission

## Clinical disclaimer

This model is educational and exploratory. It should not be used to diagnose pneumonia, rule out pneumonia, determine antibiotic need, or replace local clinical pathways.
