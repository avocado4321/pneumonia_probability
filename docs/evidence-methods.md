# Evidence Methods for v0.1

## Scope

This prototype is scoped to otherwise healthy children older than 3 months with suspected community-acquired pneumonia. It is not scoped to neonates, immunocompromised children, children with chronic lung disease, children receiving home ventilation, or ICU-only populations.

## Evidence hierarchy used

1. Pediatric systematic reviews and meta-analyses with sensitivity, specificity, LR+, or LR-.
2. Pediatric clinical practice guidelines for appropriate test interpretation and limitations.
3. Pediatric prospective or multicenter cohort studies when pooled diagnostic estimates were unavailable.
4. Expert heuristics only when no reliable pooled LR exists. These are off by default for respiratory pathogen testing.

## Chest radiograph

The calculator uses conservative CXR likelihood ratios:

- Positive CXR: LR 9.5
- Negative CXR: LR 0.11
- Equivocal CXR: LR 1.0

Rationale: pediatric imaging studies report high but heterogeneous CXR diagnostic performance. CXR is also often part of the reference standard, creating circularity. v0.1 uses conservative rounded values rather than the most optimistic estimates.

## Procalcitonin, CRP, and WBC

The calculator uses pediatric biomarker meta-analysis values for differentiating bacterial pneumonia from nonbacterial respiratory illness:

- Procalcitonin threshold: 0.59 ng/mL, sensitivity 0.69, specificity 0.64
- CRP threshold: 53 mg/L, sensitivity 0.70, specificity 0.64
- WBC threshold: 13 x10^9/L, sensitivity 0.63, specificity 0.48

Derived likelihood ratios:

- LR+ = sensitivity / (1 - specificity)
- LR- = (1 - sensitivity) / specificity

These biomarkers are adjunctive and weak to moderate at best. They should not be used as independent definitive tests.

## ANC

ANC is included because the user requested it and because CBC differential is clinically familiar. However, ANC does not have as clean a pooled pediatric diagnostic estimate as CRP/PCT/WBC in the initial evidence set. v0.1 uses an exploratory threshold:

- ANC threshold: 10 x10^9/L
- Sensitivity 0.48
- Specificity 0.88
- LR+ 4.00
- LR- 0.59

The UI labels ANC evidence as limited.

## Respiratory pathogen testing

Respiratory pathogen testing is included as an input with the following categories:

- Not done
- Negative panel
- Viral pathogen detected only
- Mycoplasma pneumoniae detected
- Bordetella pertussis or parapertussis detected
- Mixed viral + atypical/bacterial detections

v0.1 applies LR 1.0 by default to all respiratory pathogen results. The app still displays interpretive notes. This design is intentional because respiratory panels often use upper-airway specimens, and a positive result may represent causality, codetection, prolonged shedding, or colonization depending on pathogen and clinical context.

An optional heuristic toggle is included for sensitivity analysis:

- Viral pathogen only: LR 0.75
- Mycoplasma pneumoniae detected: LR 2.0
- Pertussis/parapertussis detected: LR 1.5
- Mixed detections: LR 1.2
- Negative panel: LR 1.0

These heuristic values are not validated and should not be used as clinical defaults.

## Known evidence problems

- CXR interpretation is variable.
- CXR is often embedded in the reference standard.
- Biomarkers are correlated with each other.
- Biomarkers often target bacterial vs viral/nonbacterial etiology, not pneumonia vs no pneumonia.
- Viral and bacterial coinfection is possible.
- Mycoplasma PCR can reflect infection or carriage.
- Respiratory pathogen panels differ by platform and specimen quality.
