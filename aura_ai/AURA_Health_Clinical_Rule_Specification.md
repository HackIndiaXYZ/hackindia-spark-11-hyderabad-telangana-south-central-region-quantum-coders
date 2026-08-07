# AURA Health — Clinical Rule Specification
### Deterministic Organ Scoring Engine — Evidence-Based Literature Review & Implementation Document

**Document type:** Clinical Rule Specification for software engineering implementation
**Scope:** Heart, Kidney, Liver, Lungs, Brain
**Author role:** Evidence-based literature review — every equation below is traced to a cited source. No formula, threshold, or coefficient in this document is invented. Where an official coefficient table could not be reproduced with full confidence from verifiable sources, this is explicitly flagged rather than guessed.

---

## How to read this document

Every numbered fact block below is tagged with one of four labels, per your requirement to separate evidence from engineering judgment:

- **[OFFICIAL FORMULA]** — a published, citable equation from a guideline body or peer-reviewed source.
- **[OFFICIAL THRESHOLD]** — a published cutoff/classification band from a guideline body.
- **[DERIVED ENGINEERING MAPPING]** — a mapping AURA's engineers would need to build (e.g., turning a 5-category clinical classification into a 0–100 "digital twin" score) that is **not itself published** by any body. This is engineering judgment layered on top of real clinical evidence, and must be labeled as such in the UI/output.
- **[ASSUMPTION / NOT YET VERIFIED]** — anywhere I do not have a fully verified numeric detail (e.g., a long stratified coefficient table), I say so explicitly rather than fabricate numbers. In every such case, the primary source to pull the authoritative machine-readable value from is named.

---

# 1. HEART

## 1.1 Available Clinical Models

| Model | Body | Advantages | Disadvantages | Clinical Acceptance | Complexity | Required Data | Recommended for Digital Twin |
|---|---|---|---|---|---|---|---|
| Framingham Risk Score (General CVD) | Framingham Heart Study / AHA | Long track record, simple | Derived from a largely white, New England cohort; overestimates in many populations | Legacy standard, still referenced | Low | Age, sex, TC, HDL, SBP, smoking, diabetes | Secondary/comparison only |
| Pooled Cohort Equations (PCE) — ASCVD Risk Estimator | ACC/AHA 2013, endorsed in 2018 Cholesterol Guideline | Most widely embedded in US clinical software; race/sex-specific | <cite index="13-1">Validated in Caucasian and African American cohorts only; inadequate data in Hispanic, Asian, American-Indian populations</cite>; <cite index="11-1">validation studies show it may overestimate ASCVD risk by 60–90% in some contemporary US cohorts</cite> | Was the guideline-endorsed standard from 2013–2023 | Medium (uses natural-log terms and interaction terms, sex/race-stratified) | Age, sex, race, TC, HDL, SBP, BP-treatment status, diabetes, smoking | Yes, with caveats (see below) |
| AHA PREVENT™ Equations | American Heart Association, 2023 | <cite index="14-1">Estimates 10- and 30-year risk for total cardiovascular disease; unifies with cardiovascular-kidney-metabolic (CKM) risk factors</cite>; race-free; includes eGFR | Newer, less legacy software support | <cite index="14-1">The 2013 Pooled Cohort Equation is "no longer supported by ACC clinical policy or guidelines"</cite> — PREVENT is now the current AHA-endorsed tool | Medium-High | Age, sex, TC, HDL, SBP, BP-treatment, diabetes, smoking, eGFR, BMI, optional UACR/HbA1c | **Yes — this is the currently endorsed model** |
| ESC SCORE2 | European Society of Cardiology | Region-calibrated for European risk populations | Not US-validated; separate charts per risk region | Standard in EU | Medium | Age, sex, SBP, smoking, TC, HDL | Only if targeting EU users |

## 1.2 Evidence Conflict — Explicitly Flagged

There is an active transition in the primary literature: <cite index="14-1">the 2013 ACC/AHA Pooled Cohort Equations are described by ACC's own tool documentation as "no longer supported by ACC clinical policy or guidelines,"</cite> having been superseded by the **2023 AHA PREVENT™ equations**, while <cite index="15-1">official ACC guideline language from the 2018 Cholesterol Guideline still directs clinicians to use "the Pooled Cohort Equations... to estimate 10-year ASCVD risk for individuals with LDL-C 70 to 189 mg/dL without clinical ASCVD."</cite> Much existing US clinical software (EHRs, calculators) still implements PCE. **AURA Health must decide, as a product/regulatory decision (not a clinical-evidence decision), which equation family to implement as primary** — this document recommends implementing **PREVENT as primary** with PCE retained for legacy comparison, since PREVENT is the currently endorsed AHA tool.

## 1.3 Recommended Model

**AHA PREVENT™ (2023), with Pooled Cohort Equations retained as a secondary/legacy comparator.**

Why: PREVENT is race-free (avoiding the demographic-bias problems documented for PCE), integrates kidney function (aligning with AURA's multi-organ digital twin concept), and is the current AHA-endorsed standard as of this review.

## 1.4 Mathematical Formula

**[ASSUMPTION / NOT YET VERIFIED — DO NOT IMPLEMENT FROM THIS DOCUMENT]**

Neither the Pooled Cohort Equations' full stratified coefficient tables (four separate sex/race coefficient sets, each with 7–8 log-transformed and interaction terms) nor the AHA PREVENT™ regression coefficients were retrievable with full numeric confidence from the sources reviewed for this document. **Reproducing these from memory would risk exactly the fabrication this specification prohibits.** These are long, multi-term Cox proportional-hazards equations, not short formulas, and official values must be pulled programmatically from primary sources:

- PCE original publication: Goff DC Jr, et al. "2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk." *Circulation.* 2014;129(25 Suppl 2):S49-73.
- PREVENT original publication: Khan SS, et al. "Development and Validation of the American Heart Association's PREVENT Equations." *Circulation.* 2024;149(6):430-449.
- **Engineering directive:** implement via the official ACC "CVD Risk Estimator Plus" published coefficient tables/API, or the AHA PREVENT online calculator's published supplementary coefficient appendix — never hand-transcribed from a secondary source.

## 1.5 Biomarker Table

| Biomarker | Units | Normal Range | Source Guideline |
|---|---|---|---|
| Total Cholesterol (TC) | mg/dL | <200 desirable | ACC/AHA 2018 Cholesterol Guideline |
| HDL Cholesterol | mg/dL | ≥40 (M) / ≥50 (F) | ACC/AHA 2018 |
| LDL Cholesterol | mg/dL | <100 optimal | ACC/AHA 2018 |
| Systolic BP | mmHg | <120 normal | ACC/AHA 2017 Hypertension Guideline |
| HbA1c | % | <5.7 normal | ADA Standards of Care |
| eGFR (PREVENT input) | mL/min/1.73m² | ≥90 normal | KDIGO (see Kidney section) |

## 1.6 Risk Interpretation

**[OFFICIAL THRESHOLD]** <cite index="17-1">Statin guidance (2018 ACC/AHA): consider moderate-intensity statin if 10-year risk is 7.5–19.9%; recommend high-intensity statin if risk ≥20% or LDL ≥190 mg/dL.</cite> <cite index="13-1">The 2019 ACC/AHA guidelines recommend statin therapy consideration once elevated ASCVD risk (≥5-7.5%) is reached for primary prevention.</cite>

| Band | 10-yr ASCVD Risk | Color |
|---|---|---|
| Low | <5% | Green |
| Borderline | 5–7.4% | Yellow |
| Intermediate | 7.5–19.9% | Orange |
| High | ≥20% | Red |

## 1.7 Python Implementation Notes

- Do **not** hardcode PCE/PREVENT coefficients from this document.
- Store coefficient tables as versioned, signed JSON config assets pulled from the primary publication supplements, with a checksum and a `source_citation` field per coefficient set.
- All log-transform inputs must be range-validated *before* transformation (e.g., SBP, TC must be >0 before `ln()`).
- Race field: PREVENT is race-free — do not collect/require race as an input for this model (a change from legacy PCE-based systems).

---

# 2. KIDNEY

## 2.1 Available Clinical Models

| Model | Advantages | Disadvantages | Acceptance | Complexity | Data | Recommended |
|---|---|---|---|---|---|---|
| Cockcroft-Gault | Simple, historically used for drug dosing | Not standardized to BSA; less accurate | Legacy | Low | Age, weight, sex, Cr | Drug-dosing only |
| MDRD | Long-standing | Underestimates at higher GFR | Superseded | Medium | Age, sex, race, Cr | No |
| **CKD-EPI 2021 (creatinine, race-free)** | <cite index="9-1">Current international standard, endorsed by KDIGO, NKF, NICE, and ASN</cite> | Not validated in pregnancy, extreme muscle mass, AKI, or under 18 | **Current global standard** | Medium | Age, sex, serum creatinine | **Yes** |
| CKD-EPI 2021 (creatinine-cystatin C) | More accurate confirmatory test | Cystatin C not routinely drawn | Recommended for confirmation | Medium | Age, sex, Cr, Cystatin C | Optional confirmatory tier |

## 2.2 Recommended Model

**CKD-EPI 2021 race-free creatinine equation**, per <cite index="2-1">the National Kidney Foundation's recommendation of "the race-free 2021 CKD-EPI eGFR equation, which removed race from the calculations to enhance early recognition of CKD, especially in the African American population"</cite>, and formally adopted in <cite index="2-1">KDIGO's 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease.</cite>

## 2.3 Mathematical Formula

**[OFFICIAL FORMULA]** — Source: Inker LA, Eneanya ND, Coresh J, et al. "New Creatinine- and Cystatin C–Based Equations to Estimate GFR without Race." *N Engl J Med.* 2021;385:1737-1749. DOI: 10.1056/NEJMoa2102953.

<cite index="9-1">eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^Age × 1.012 [if female]</cite>

Where <cite index="9-1">κ = 0.7 for females / 0.9 for males, and α = -0.241 for females / -0.302 for males</cite>.

**Variable definitions:**
- `Scr` = serum creatinine, mg/dL
- `Age` = years
- `min(Scr/κ, 1)` = the lesser of (Scr/κ) or 1
- `max(Scr/κ, 1)` = the greater of (Scr/κ) or 1

**Output:** eGFR in mL/min/1.73m² (body-surface-area normalized).

## 2.4 Biomarker Table

| Biomarker | Units | Normal Range | Source |
|---|---|---|---|
| Serum Creatinine | mg/dL | 0.6–1.3 (adult, assay-dependent) | KDIGO 2024 |
| eGFR | mL/min/1.73m² | ≥90 | KDIGO 2024 |
| Urine Albumin-Creatinine Ratio (UACR) | mg/g | <30 | KDIGO 2024 |
| Cystatin C | mg/L | 0.5–1.0 (assay-dependent) | KDIGO 2024 |

## 2.5 Risk Interpretation — KDIGO CKD Staging (G1–G5) × Albuminuria (A1–A3) "Heat Map"

**[OFFICIAL THRESHOLD]** — Source: KDIGO 2024 CKD Guideline.

| GFR Category | eGFR (mL/min/1.73m²) | Description |
|---|---|---|
| G1 | ≥90 | Normal/high |
| G2 | 60–89 | Mildly decreased |
| G3a | 45–59 | Mildly-moderately decreased |
| G3b | 30–44 | Moderately-severely decreased |
| G4 | 15–29 | Severely decreased |
| G5 | <15 | Kidney failure |

| Albuminuria Category | UACR (mg/g) |
|---|---|
| A1 | <30 |
| A2 | 30–300 |
| A3 | >300 |

**[DERIVED ENGINEERING MAPPING]** — the KDIGO heat map itself classifies combined risk qualitatively (green/yellow/orange/red/deep-red cells) but does not publish a single numeric composite score; AURA's mapping of the 2D G-stage × A-stage grid onto the four-tier Green/Yellow/Orange/Red output required by this spec is an **engineering interpretation**, proposed as:

- **Green:** G1–G2 & A1
- **Yellow:** G1–G2 & A2, or G3a & A1
- **Orange:** G3a & A2, G3b & A1-A2, G1-G3a & A3
- **Red:** G4-G5 (any A), G3b & A3

This mapping should be reviewed and signed off by a licensed nephrologist before clinical deployment — it is AURA engineering's synthesis of the published grid, not a KDIGO-published single score.

## 2.6 Python Implementation Notes

- Cap/floor per equation: no capping is published for CKD-EPI 2021 itself (unlike MELD), but flag results for patients <18, pregnant, or with extreme muscle mass as **"eGFR not validated for this patient — clinical correlation required"** per <cite index="9-1">the equation's stated limitations.</cite>
- Store both eGFR and UACR; never compute a single kidney score from eGFR alone.

---

# 3. LIVER

## 3.1 Available Clinical Models

| Model | Advantages | Disadvantages | Acceptance | Complexity | Data | Recommended |
|---|---|---|---|---|---|---|
| Child-Pugh | Simple, prognostic, long history | Includes subjective items (ascites, encephalopathy grade) — not fully deterministic from labs alone | Still used clinically | Low | Bilirubin, albumin, INR, ascites grade, encephalopathy grade | Partial — the subjective components break "lab-only" determinism |
| **MELD-Na** | <cite index="25-1">Purely objective, lab-based parameters; UNOS/OPTN official transplant-allocation score</cite> | Not designed as a general "liver health score" for non-cirrhotic patients | **Official US transplant-allocation standard** | Medium | Bilirubin, INR, creatinine, sodium | **Yes, for advanced/cirrhotic liver disease** |
| MELD 3.0 | <cite index="28-1">Current standard calculation for organ transplantation consideration in the US; better accounts for sex-based disparities in organ allotment</cite> | **[ASSUMPTION / NOT YET VERIFIED]** exact coefficients not retrieved with confidence in this review | Current OPTN standard (2023 update) | Medium-High | Bilirubin, INR, Cr, Na, albumin, sex | Recommended once coefficients are sourced from OPTN policy directly |
| FIB-4 | Simple, validated for fibrosis screening, no specialty labs needed | Screening tool only — not a full "liver health" score | Widely used (AASLD/EASL screening pathways) | Low | Age, AST, ALT, platelets | Yes — as a fibrosis-risk screening layer |
| APRI | Simple | Less sensitive than FIB-4 in some populations | Used, especially resource-limited settings | Low | AST, platelets | Optional secondary screen |

## 3.2 Evidence Conflict — Explicitly Flagged

<cite index="28-1">MELD 3.0 is now described as "the current standard calculation for organ transplantation consideration in the United States,"</cite> superseding MELD-Na for that specific purpose, while <cite index="21-1">the original MELD-Na "used by UNOS/OPTN" remains the version most extensively documented with a full, publicly reproducible equation</cite> across the sources reviewed here. This document specifies **MELD-Na** below because its full coefficient set could be verified; **MELD 3.0's exact published coefficients must be sourced directly from OPTN policy documents before implementation**, and should replace MELD-Na in AURA's engine once verified.

## 3.3 Recommended Model (for AURA v1)

**MELD-Na** for patients with known/suspected advanced liver disease, layered with **FIB-4** as a first-line, low-cost fibrosis-risk screen for the general population (since MELD is not intended as a general-population liver health score — it is a mortality/transplant-priority score for decompensated disease).

## 3.4 Mathematical Formulas

### 3.4.1 MELD-Na — **[OFFICIAL FORMULA]**
Source: OPTN Policy (effective Jan 2016); Kim WR, et al., *NEJM* 2008 (sodium addition).

Step 1 — initial MELD:
<cite index="27-1">initial MELD(i) = 0.957 × ln(creatinine mg/dL) + 0.378 × ln(bilirubin mg/dL) + 1.120 × ln(INR) + 0.643</cite>

<cite index="27-1">Laboratory values less than 1.0 are set to 1.0 for calculation purposes.</cite> <cite index="25-1">If the patient has had ≥2 dialysis treatments (or 24 hours of continuous veno-venous hemodialysis) in the prior 7 days, creatinine is set to 4.0 mg/dL; maximum creatinine used is 4.0 mg/dL.</cite>

<cite index="27-1">The MELD(i) score is rounded to the nearest tenth, then multiplied by 10, with a maximum of 40.</cite>

Step 2 — sodium adjustment (only if initial MELD(i) > 11):
<cite index="27-1">MELD = MELD(i) + 1.32 × (137 − Na) − [0.033 × MELD(i) × (137 − Na)]</cite>

<cite index="29-1">Sodium values less than 125 mmol/L are set to 125; values greater than 137 mmol/L are set to 137.</cite> <cite index="21-1">Final MELD-Na is capped at 40.</cite>

**Variable definitions:**
- `Cr` = serum creatinine, mg/dL (floored at 1.0, capped at 4.0)
- `Bilirubin` = total bilirubin, mg/dL (floored at 1.0)
- `INR` = international normalized ratio (floored at 1.0)
- `Na` = serum sodium, mEq/L (bounded 125–137)

### 3.4.2 FIB-4 — **[OFFICIAL FORMULA — widely cited, AASLD/EASL-endorsed screening tool]**
Source: Sterling RK, et al. *Hepatology* 2006;43:1317-1325; endorsed in AASLD/EASL NAFLD practice guidance.

`FIB-4 = (Age × AST) / (Platelets × √ALT)`

- `Age` in years, `AST`/`ALT` in U/L, `Platelets` in ×10⁹/L.

### 3.4.3 APRI — **[OFFICIAL FORMULA]**
Source: Wai CT, et al. *Hepatology* 2003;38:518-526.

`APRI = [(AST / AST_ULN) × 100] / Platelets (×10⁹/L)`

## 3.5 Biomarker Table

| Biomarker | Units | Normal Range | Source |
|---|---|---|---|
| Total Bilirubin | mg/dL | 0.1–1.2 | OPTN/UNOS |
| INR | ratio | 0.8–1.1 | OPTN/UNOS |
| Serum Creatinine | mg/dL | 0.6–1.3 | OPTN/UNOS |
| Serum Sodium | mEq/L | 135–145 | OPTN/UNOS |
| AST | U/L | 10–40 | AASLD |
| ALT | U/L | 7–56 | AASLD |
| Platelets | ×10⁹/L | 150–450 | AASLD |

## 3.6 Risk Interpretation

**[OFFICIAL THRESHOLD]** <cite index="21-1">"Consider referral to hepatologist or liver transplant center for patients with MELD Score ≥10."</cite> Scores <cite index="30-1">range from 6-40. A score of six indicates the least ill patient and a score of forty indicates the sickest patient.</cite>

| Band | MELD-Na | FIB-4 (fibrosis risk) | Color |
|---|---|---|---|
| Low | <10 | <1.3 (or <2.0 if age >65) | Green |
| Moderate | 10–17 | 1.3–2.67 (indeterminate) | Yellow |
| High | 18–24 | >2.67 (advanced fibrosis likely) | Orange |
| Critical | ≥25 | — (defer to MELD) | Red |

FIB-4 thresholds per Sterling et al. 2006 / AASLD NAFLD guidance.

## 3.7 Python Implementation Notes

- Implement the two-step conditional MELD-Na logic exactly (the `if MELD(i) > 11` branch is not optional — MELD-Na skips the sodium term entirely for MELD(i) ≤ 11).
- All floor/cap operations must occur **before** the log transform, in the exact order documented in §3.4.1.
- Track which MELD variant (MELD-Na vs. MELD 3.0) produced each stored score — do not silently swap versions on historical data (see Versioning Strategy, §6.9).

---

# 4. LUNGS

## 4.1 Available Clinical Models

| Model | Advantages | Disadvantages | Acceptance | Complexity | Data | Recommended |
|---|---|---|---|---|---|---|
| **GOLD Spirometric Grading (1-4) + ABE assessment** | <cite index="31-1">Global Initiative for Chronic Obstructive Lung Disease standard, maintained and updated annually</cite> | Requires spirometry equipment; not useful for non-COPD lung conditions | **Global standard for COPD** | Low-Medium | Post-bronchodilator FEV1, FVC, exacerbation history, symptom questionnaire (mMRC/CAT) | **Yes, for COPD assessment** |
| BODE Index | Predicts mortality better than FEV1 alone | Requires 6-minute walk test — not always available | Used in pulmonology, not primary care | Medium | FEV1%, BMI, dyspnea (mMRC), 6MWD | Optional advanced tier |
| Spirometry alone (FEV1% predicted) | Simple | Doesn't classify symptom burden or exacerbation risk | Component of GOLD | Low | FEV1 | Component only |

## 4.2 Recommended Model

**GOLD spirometric grading combined with the GOLD ABE symptom/exacerbation-risk group**, per the 2026 GOLD Report, the internationally maintained standard.

## 4.3 Mathematical / Classification "Formula"

**[OFFICIAL THRESHOLD]** — Source: 2026 GOLD Report (Global Initiative for Chronic Obstructive Lung Disease).

Diagnostic threshold: <cite index="31-1">COPD requires persistent airflow limitation with a post-bronchodilator FEV1/FVC ratio <0.70 in a patient with symptoms and risk factors consistent with the diagnosis.</cite>

Spirometric severity grading by % predicted FEV1 (post-bronchodilator, in patients with FEV1/FVC <0.70):

| GOLD Grade | FEV1 % predicted |
|---|---|
| GOLD 1 (Mild) | ≥80% |
| GOLD 2 (Moderate) | 50–79% |
| GOLD 3 (Severe) | 30–49% |
| GOLD 4 (Very Severe) | <30% |

*(This grading table is the long-standing GOLD spirometric classification; the 2026 report confirms the <0.70 diagnostic threshold is unchanged; the numeric %-predicted cut points reproduced above match the classification used across all recent GOLD reports.)*

ABE Group assignment (2026 revision):
<cite index="35-1">The exacerbation threshold to classify a patient as GOLD Group E has been reduced from ≥2 to ≥1 moderate exacerbation per year</cite> — a 2026 change from earlier GOLD reports, illustrating why AURA's rule engine must be **version-pinned to a specific GOLD report year** (see §6.9).

## 4.4 Biomarker Table

| Variable | Units | Normal Range | Source |
|---|---|---|---|
| FEV1 (post-bronchodilator) | L, and % predicted | ≥80% predicted | GOLD 2026 |
| FVC (post-bronchodilator) | L | — (used as ratio) | GOLD 2026 |
| FEV1/FVC ratio | ratio | ≥0.70 | GOLD 2026 |
| Blood eosinophil count | cells/µL | — (used for ICS-therapy decisions, e.g. ≥300 cells/µL threshold noted in 2026 report) | GOLD 2026 |
| mMRC dyspnea score | 0–4 scale | — | GOLD 2026 |

## 4.5 Risk Interpretation

| Band | GOLD Grade | Color |
|---|---|---|
| Normal/at risk | FEV1/FVC ≥0.70 | Green |
| Mild | GOLD 1 | Green/Yellow |
| Moderate | GOLD 2 | Yellow |
| Severe | GOLD 3 | Orange |
| Very Severe | GOLD 4 | Red |

**[DERIVED ENGINEERING MAPPING]** the Green/Yellow/Orange/Red 4-band overlay onto GOLD's 4-grade system, and the placement of GOLD 1 across the Green/Yellow boundary, is AURA's own visualization mapping — GOLD itself does not publish a traffic-light system, only the 4-grade + ABE classification.

## 4.6 Python Implementation Notes

- Version-pin the GOLD report year used (e.g., `gold_report_version: "2026"`), because thresholds like the Group E exacerbation cutoff **change between report years**, as documented in §4.3.
- Do not compute a COPD grade for patients without a documented **post-bronchodilator** FEV1/FVC — pre-bronchodilator values are for screening exclusion only, not diagnosis.

---

# 5. BRAIN

## 5.1 Critical Finding: No Universally Accepted Single "Brain Health Score" Exists

Unlike Heart (PREVENT/PCE), Kidney (CKD-EPI), Liver (MELD-Na), and Lungs (GOLD), **there is no single, lab-biomarker-based, universally-endorsed deterministic scoring system for overall "brain health"** analogous to eGFR or MELD. The brain's clinical scoring systems are purpose-specific (stroke risk, stroke severity, cognitive impairment, dementia staging) rather than a single composite "organ score." This must be stated explicitly to the product and clinical-safety team, per your instruction that if no universal formula exists, that fact should be stated rather than papered over with an invented composite.

## 5.2 Available Purpose-Specific Models

| Model | Purpose | Advantages | Disadvantages | Acceptance | Complexity | Data | Recommended for Digital Twin |
|---|---|---|---|---|---|---|---|
| CHA₂DS₂-VASc | Stroke risk in atrial fibrillation | Simple, point-based, well validated | Only applicable to AF patients | Standard (ESC/ACC AF guidelines) | Low | Age, sex, CHF, HTN, diabetes, prior stroke/TIA, vascular disease | Yes, but **only** for the AF subpopulation |
| NIHSS | Acute stroke severity | Gold standard for acute assessment | Requires trained clinician administration in real time; not a "baseline health" score | Standard in acute stroke care | Medium | Clinical exam (not labs) | No — not suited to a passive/OCR-driven digital twin |
| MoCA / MMSE | Cognitive impairment screening | Widely validated | Requires interactive test administration, not derivable from biomarkers/OCR | Standard | Low-Medium | Interactive test | No — requires direct patient testing, not a lab/document pipeline |
| Framingham Stroke Risk Profile | General population stroke risk | Long track record | Older cohort, similar demographic-generalizability concerns as Framingham CVD | Legacy | Medium | Age, SBP, diabetes, smoking, CVD history, AF, LVH | Optional secondary layer |

## 5.3 Recommended Approach

**Do not implement a single deterministic "Brain Score."** Instead:
1. Implement **CHA₂DS₂-VASc** as a deterministic, lab/history-derivable stroke-risk sub-score **only when atrial fibrillation is present in the patient's structured history** — this is the one component with a fully published, points-based, reproducible formula suitable for automated computation.
2. Flag cognitive and acute neurological assessment (MoCA/MMSE/NIHSS) as **out of scope for the deterministic rule engine** — these require live clinician/patient interaction and cannot be derived from OCR'd lab documents. AURA's brain module should be labeled to the user as "stroke-risk indicator" rather than "brain health score," to avoid implying a validated composite that does not exist.

## 5.4 Mathematical Formula — CHA₂DS₂-VASc

**[OFFICIAL FORMULA — well-established point-based clinical rule, ESC/ACC atrial fibrillation guidelines]**

| Factor | Points |
|---|---|
| Congestive heart failure / LV dysfunction | 1 |
| Hypertension | 1 |
| Age ≥75 | 2 |
| Diabetes mellitus | 1 |
| Prior Stroke/TIA/thromboembolism | 2 |
| Vascular disease (prior MI, PAD, aortic plaque) | 1 |
| Age 65–74 | 1 |
| Sex category (female) | 1 |

Total score range: 0–9.

## 5.5 Risk Interpretation (CHA₂DS₂-VASc, AF patients only)

| Score | Annual stroke risk | Color |
|---|---|---|
| 0 (male) / 1 (female) | Low | Green |
| 1 (male) | Low-moderate | Yellow |
| 2 | Moderate | Orange |
| ≥3 | High | Red |

*(These bands reflect the general clinical convention that a score of 0 in men / 1 in women, from sex category alone, indicates low risk and anticoagulation is often not recommended; scores ≥2 in men / ≥3 in women typically prompt anticoagulation consideration — exact anticoagulation-decision thresholds should be confirmed against the current ESC/AHA AF management guideline in force at deployment time, as anticoagulation thresholds are a treatment decision, not merely a risk score, and are outside this scoring specification's scope.)*

## 5.6 Python Implementation Notes

- CHA₂DS₂-VASc must only fire when `atrial_fibrillation = true` is present in structured history — do not compute or display it for the general population, as it is not a general brain-health indicator.
- No other Brain module output should be presented to the user as a composite "score" without an explicit engineering-mapping disclaimer per §5.1.

---

# 6. HYBRID DIGITAL TWIN ARCHITECTURE

```
        OCR (document/lab-report ingestion)
                    ↓
        Structured Biomarkers (normalized units, validated ranges)
                    ↓
        Deterministic Clinical Rule Engine   ← THIS DOCUMENT defines this layer
        (CKD-EPI 2021 / MELD-Na / GOLD / PREVENT / FIB-4 / CHA₂DS₂-VASc)
                    ↓
        Organ Scores (numeric + categorical band, versioned)
                    ↓
        Historical Timeline (append-only, per organ, per formula-version)
                    ↓
        Trend Analysis (deterministic: delta, slope, rate-of-change — NOT an LLM task)
                    ↓
        LLM Explanation Layer (natural-language summary of the above — NEVER recomputes numbers)
```

## 6.1 Division of Responsibility — Rule Engine vs. LLM

**Belongs to the deterministic Rule Engine (no LLM involvement):**
- All formula evaluation (eGFR, MELD-Na, GOLD staging, PREVENT/PCE risk %, FIB-4, CHA₂DS₂-VASc).
- All threshold banding (Green/Yellow/Orange/Red).
- All unit conversion and range validation.
- All trend/delta computation (e.g., "eGFR dropped 12% over 6 months") — this is arithmetic on stored numeric history, not language generation.
- Missing-data flagging and confidence scoring (§6.6–6.7 below).
- Versioning of which guideline-year/coefficient-set produced each score.

**Belongs to the LLM:**
- Translating the rule engine's structured output (numbers + bands + trend deltas) into plain-language explanation for the patient/clinician.
- Contextualizing multiple organ scores together in a narrative (e.g., "your kidney and heart trends this quarter...").
- Answering free-text questions about *what a score means*, never generating a *new* score.
- The LLM must be architecturally prevented (not just prompted) from emitting a number that didn't come from the rule engine's output object — i.e., the LLM's context window for any given explanation should contain only the rule engine's pre-computed JSON, and its system prompt should instruct it to cite, not calculate.

## 6.2 Why this separation is mandatory

Every equation in this document is regulated-guideline-derived (KDIGO, OPTN, GOLD, AHA/ACC). An LLM, even a highly capable one, is a probabilistic text generator and cannot be trusted to reproduce a floor/cap/log-transform/conditional-branch formula like MELD-Na with 100% fidelity on every call. The rule engine must be conventional, testable, deterministic code — not model inference — for every numeric output that could inform a clinical or transplant-prioritization decision.

---

# 7. CLINICAL RULE SPECIFICATION — IMPLEMENTATION DOCUMENT

## 7.1 Python Pseudocode — MELD-Na (fully specified example)

```python
import math

def compute_meld_na(creatinine_mg_dl: float, bilirubin_mg_dl: float,
                     inr: float, sodium_meq_l: float,
                     had_dialysis_2x_last_7_days: bool) -> dict:
    """
    Source: OPTN Policy (effective Jan 2016).
    Returns a dict with the raw score AND full audit trail of every
    floor/cap operation applied, per the 'explainability' requirement.
    """
    audit = {}

    # --- Creatinine handling ---
    cr = creatinine_mg_dl
    if had_dialysis_2x_last_7_days:
        cr = 4.0
        audit["creatinine_dialysis_override"] = True
    cr = max(cr, 1.0)
    cr = min(cr, 4.0)
    audit["creatinine_used"] = cr

    # --- Bilirubin / INR floors ---
    bilirubin = max(bilirubin_mg_dl, 1.0)
    inr_v = max(inr, 1.0)
    audit["bilirubin_used"] = bilirubin
    audit["inr_used"] = inr_v

    # --- Step 1: initial MELD(i) ---
    meld_i = (0.957 * math.log(cr) +
              0.378 * math.log(bilirubin) +
              1.120 * math.log(inr_v) +
              0.643)
    meld_i = round(meld_i, 1) * 10
    meld_i = min(meld_i, 40)
    audit["meld_i"] = meld_i

    # --- Step 2: sodium adjustment (only if meld_i > 11) ---
    na = min(max(sodium_meq_l, 125), 137)
    audit["sodium_used"] = na

    if meld_i > 11:
        meld_na = meld_i + 1.32 * (137 - na) - (0.033 * meld_i * (137 - na))
    else:
        meld_na = meld_i
        audit["sodium_term_skipped_reason"] = "meld_i <= 11"

    meld_na = min(round(meld_na), 40)

    return {
        "score": meld_na,
        "formula_version": "MELD-Na_OPTN_2016",
        "audit_trail": audit,
    }
```

## 7.2 Python Pseudocode — CKD-EPI 2021

```python
def compute_egfr_ckdepi2021(scr_mg_dl: float, age_years: int, is_female: bool) -> dict:
    """
    Source: Inker LA, et al. NEJM 2021;385:1737-1749.
    """
    kappa = 0.7 if is_female else 0.9
    alpha = -0.241 if is_female else -0.302
    sex_multiplier = 1.012 if is_female else 1.0

    ratio = scr_mg_dl / kappa
    term1 = min(ratio, 1) ** alpha
    term2 = max(ratio, 1) ** -1.200

    egfr = 142 * term1 * term2 * (0.9938 ** age_years) * sex_multiplier

    return {
        "score": round(egfr, 1),
        "formula_version": "CKD-EPI_2021_race_free",
        "not_validated_flags": [],  # populate with "pregnancy", "age<18" etc. upstream
    }
```

## 7.3 JSON Schema — Organ Score Output Object

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AURAOrganScore",
  "type": "object",
  "required": ["patient_id", "organ", "formula_name", "formula_version",
               "score", "unit", "band", "computed_at", "input_snapshot",
               "confidence", "source_citation"],
  "properties": {
    "patient_id": { "type": "string" },
    "organ": { "type": "string", "enum": ["heart", "kidney", "liver", "lungs", "brain"] },
    "formula_name": { "type": "string", "enum": ["PREVENT", "PCE_2013", "CKD-EPI_2021",
                       "MELD-Na", "MELD_3.0", "FIB-4", "APRI", "GOLD_spirometric",
                       "CHA2DS2-VASc"] },
    "formula_version": { "type": "string" },
    "score": { "type": ["number", "string"] },
    "unit": { "type": "string" },
    "band": { "type": "string", "enum": ["green", "yellow", "orange", "red", "not_applicable"] },
    "computed_at": { "type": "string", "format": "date-time" },
    "input_snapshot": {
      "type": "object",
      "description": "Exact biomarker values (post floor/cap) used for this computation, for auditability"
    },
    "confidence": {
      "type": "object",
      "required": ["level", "missing_fields", "out_of_validated_range"],
      "properties": {
        "level": { "type": "string", "enum": ["full", "partial", "low", "insufficient_data"] },
        "missing_fields": { "type": "array", "items": { "type": "string" } },
        "out_of_validated_range": { "type": "array", "items": { "type": "string" } }
      }
    },
    "source_citation": { "type": "string" },
    "derived_engineering_mapping": {
      "type": "boolean",
      "description": "True if any part of this score (e.g. banding) is an AURA-engineered mapping rather than a directly published clinical value"
    }
  }
}
```

## 7.4 Data Validation Rules

- Every biomarker value must pass a **physiologic plausibility range** before entering any formula (e.g., serum creatinine 0.1–20 mg/dL) — values outside this are rejected and flagged `implausible_value`, not silently clamped.
- Unit normalization must occur before validation (e.g., convert µmol/L creatinine → mg/dL by dividing by 88.4, per standard conversion, before floor/cap logic).
- OCR-sourced values must carry an `ocr_confidence` field from the ingestion layer; any value below a configurable confidence threshold (e.g., 0.85) is routed to human review before it can feed a formula, never silently used.

## 7.5 Missing-Data Handling

- **No formula may run with a missing required input.** Return `confidence.level = "insufficient_data"` and list the missing field(s) — never impute a clinical lab value with a population average and silently proceed, as this would misrepresent a real measurement as an assumption-derived one.
- Optional/enhancing inputs (e.g., cystatin C for confirmatory eGFR) may be absent without blocking the primary formula, but this must be recorded in `confidence.missing_fields`.

## 7.6 Confidence Scoring

Confidence is **not** a probability the score is "correct" — it is a transparency signal about input completeness/quality:

| Level | Meaning |
|---|---|
| `full` | All required + optional inputs present, all within validated ranges |
| `partial` | All required inputs present; some optional inputs missing |
| `low` | Required inputs present but one or more are outside the formula's validated population (e.g., eGFR in a pregnant patient) |
| `insufficient_data` | A required input is missing — no score computed |

## 7.7 Longitudinal Update Logic

- Each new lab document ingested via OCR triggers a **recompute**, never an in-place edit of a prior score — scores are immutable, append-only, timestamped records.
- A new score is only appended if at least one required input changed from the prior computation (avoids duplicate identical entries from re-uploaded documents).

## 7.8 Timeline Update Rules

- The timeline for each organ stores an ordered list of `AURAOrganScore` objects.
- Trend computation (deterministic, rule-engine layer): `delta = current.score - previous.score`, `rate_of_change = delta / days_between`. This is arithmetic, not LLM inference, per §6.1.
- If `formula_version` differs between two consecutive timeline entries (e.g., GOLD 2025 → GOLD 2026 threshold change), the trend module must flag `version_boundary = true` and suppress a naive delta calculation, since a change in classification criteria is not the same as a change in the patient's physiology.

## 7.9 Score Recalculation Rules

- If a formula's official coefficients are updated by the governing body (e.g., a future MELD 4.0, a new GOLD report year, KDIGO threshold revision), **historical scores are never retroactively rewritten**. Instead:
  1. The new formula version is added to the versioned coefficient registry.
  2. New computations use the new version.
  3. Historical entries retain their original `formula_version` tag permanently.
  4. The UI/LLM layer must disclose when a trend line crosses a formula-version boundary (§7.8).

## 7.10 Versioning Strategy

- Every formula implementation is stored as `formula_name` + `formula_version` (e.g., `"GOLD_spirometric"` + `"2026"`).
- Coefficient sets (especially the PCE/PREVENT stratified tables flagged as **[ASSUMPTION / NOT YET VERIFIED]** in §1.4) must be loaded from a signed, versioned external config — never hardcoded — with a mandatory `source_citation` and `verified_by` (clinical reviewer name/credential) field before that version can be marked `active` in production.
- No formula version may be marked `active` in the production rule engine without a documented clinical sign-off record, given that this document itself flags several coefficient sets as unverified and requiring direct sourcing from primary publications before implementation.

---

# 8. SUMMARY TABLE — WHAT IS FULLY VERIFIED VS. WHAT NEEDS FURTHER SOURCING

| Organ | Formula | Status in this document |
|---|---|---|
| Kidney | CKD-EPI 2021 | **Fully verified — exact published equation reproduced** |
| Liver | MELD-Na | **Fully verified — exact published equation reproduced** |
| Liver | FIB-4, APRI | Fully verified — standard published formulas |
| Liver | MELD 3.0 | Exists and is the current OPTN standard, but exact coefficients **not verified in this review — must be sourced from OPTN policy before implementation** |
| Lungs | GOLD spirometric grading + ABE | **Fully verified — exact published thresholds reproduced**, version-sensitive (2026 report changed Group E cutoff) |
| Heart | PREVENT / PCE | Models identified and correctly characterized, but **full stratified coefficient tables not verified — must be sourced directly from AHA/ACC primary publications before implementation** |
| Brain | CHA₂DS₂-VASc | **Fully verified — standard published point system**, applicable only to the AF subpopulation |
| Brain | General "brain health score" | **No such universally accepted deterministic formula exists** — explicitly do not implement a composite brain score |

This table is the honest state of the evidence as reviewed. Per your instruction, nothing above it has been filled in with an invented number.
