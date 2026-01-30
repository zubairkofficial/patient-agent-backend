import { z } from 'zod';

// ==================== Disclosure Rules Schema ====================
export const DisclosureRulesSchema = z.object({
  spontaneous: z.boolean(),
  requires_open: z.boolean(),
  requires_direct: z.boolean(),
  requires_normalization: z.boolean(),
  requires_empathy_first: z.boolean(),
});

// ==================== Symptoms Schema ====================
export const PatientSymptomSchema = z.object({
  symptom_id: z.string(),
  symptom_code: z.string(),
  symptom_name: z.string(),
  present: z.boolean(),
  severity: z.number().min(0).max(3),
  disclosure_rules: DisclosureRulesSchema,
  db_present: z.boolean().default(true),
});

// ==================== Diagnosis Schema ====================
export const PrimaryDiagnosisSchema = z.object({
  dx_id: z.number(),
  name: z.string(),
  code: z.string(),
  confidence: z.enum(['high', 'moderate', 'low']),
  rationale: z.string(),
  db_present: z.boolean().default(true),
});

export const RuleOutDiagnosisSchema = z.object({
  dx_id: z.number(),
  name: z.string(),
  code: z.string(),
  why_ruled_out: z.string(),
  db_present: z.boolean().default(true),
});

// ==================== Risk Assessment Schema ====================
export const SuicideRiskFactorsSchema = z.object({
  passive_death_wish: z.boolean(),
  active_ideation: z.boolean(),
  plan: z.boolean(),
  intent: z.boolean(),
  protective_factors: z.array(z.string()),
});

export const RiskAssessmentSchema = z.object({
  suicide_risk: SuicideRiskFactorsSchema,
  homicide_risk: z.boolean(),
});

// ==================== Mental Status Schema ====================
export const MentalStatusAudioOnlySchema = z.object({
  speech: z.string(),
  mood: z.string(),
  affect: z.string(),
  thought_process: z.string(),
  thought_content: z.string(),
  perception: z.string(),
  cognition: z.string(),
  insight: z.string(),
  judgment: z.string(),
});

// ==================== Interaction Style Schema ====================
export const InteractionStyleSchema = z.object({
  verbosity: z.enum(['low', 'moderate', 'high']),
  affect_style: z.string(),
  trust_baseline: z.enum(['guarded', 'neutral', 'open']),
  defensiveness_triggers: z.array(z.string()),
  engagement_improves_with: z.array(z.string()),
});

// ==================== Disclosure Policy Schema ====================
export const DisclosurePolicySchema = z.object({
  sensitive_topics: z.array(z.string()),
  likely_minimization: z.array(z.string()),
  empathy_required_topics: z.array(z.string()),
});

// ==================== Treatment Options Schema ====================
export const TreatmentOptionSchema = z.object({
  treatment_id: z.string(),
  treatment_name: z.string(),
  treatment_code: z.string(),
  rationale: z.string(),
  db_present: z.boolean().default(true),
});

export const TreatmentOptionsSchema = z.object({
  recommended: z.array(TreatmentOptionSchema),
  alternatives: z.array(TreatmentOptionSchema),
  not_recommended: z.array(TreatmentOptionSchema),
});

// ==================== Red Flag Triggers Schema ====================
export const RedFlagTriggerSchema = z.object({
  trigger: z.string(),
  expected_follow_up: z.string(),
});

// ==================== Scoring Blueprint Schema ====================
export const ScoringBlueprintSchema = z.object({
  must_elicit: z.array(z.string()),
  must_rule_out: z.array(z.string()),
  communication_goals: z.array(z.string()),
});

// ==================== Case Metadata Schema ====================
export const CaseMetadataSchema = z.object({
  case_id: z.string(),
  generation_seed: z.number(),
  difficulty: z.enum(['easy', 'moderate', 'hard']),
  setting: z.string(),
  chief_complaint: z.string(),
});

// ==================== Patient Profile Schema ====================
export const GeneratedPatientProfileSchema = z.object({
  schema_version: z.string(),
  case_metadata: CaseMetadataSchema,
  primary_diagnosis: PrimaryDiagnosisSchema,
  rule_out_diagnoses: z.array(RuleOutDiagnosisSchema),
  symptoms: z.array(PatientSymptomSchema),
  pertinent_negatives: z.array(z.string()),
  risk_assessment: RiskAssessmentSchema,
  mental_status_audio_only: MentalStatusAudioOnlySchema,
  interaction_style: InteractionStyleSchema,
  disclosure_policy: DisclosurePolicySchema,
  treatment_options: TreatmentOptionsSchema,
  red_flag_triggers: z.array(RedFlagTriggerSchema),
  scoring_blueprint: ScoringBlueprintSchema,
});

export type GeneratedPatientProfile = z.infer<
  typeof GeneratedPatientProfileSchema
>;
