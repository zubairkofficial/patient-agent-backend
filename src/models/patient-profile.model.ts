import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { GradingChat } from './grading-chat.model';

// ==================== Disclosure Rules ====================
export interface DisclosureRules {
  spontaneous: boolean;
  requires_open: boolean;
  requires_direct: boolean;
  requires_normalization: boolean;
  requires_empathy_first: boolean;
}

// ==================== Symptoms ====================
export interface PatientSymptom {
  symptom_id: string;
  present: boolean;
  severity: number;
  disclosure_rules: DisclosureRules;
}

// ==================== Diagnosis ====================
export interface PrimaryDiagnosis {
  dx_id: number;
  name: string;
  confidence: 'high' | 'moderate' | 'low';
  rationale: string;
}

export interface RuleOutDiagnosis {
  dx_id: number;
  name: string;
  why_ruled_out: string;
}

// ==================== Risk Assessment ====================
export interface SuicideRiskFactors {
  passive_death_wish: boolean;
  active_ideation: boolean;
  plan: boolean;
  intent: boolean;
  protective_factors: string[];
}

export interface RiskAssessment {
  suicide_risk: SuicideRiskFactors;
  homicide_risk: boolean;
}

// ==================== Mental Status ====================
export interface MentalStatusAudioOnly {
  speech: string;
  mood: string;
  affect: string;
  thought_process: string;
  thought_content: string;
  perception: string;
  cognition: string;
  insight: string;
  judgment: string;
}

// ==================== Interaction Style ====================
export interface InteractionStyle {
  verbosity: 'low' | 'moderate' | 'high';
  affect_style: string;
  trust_baseline: 'guarded' | 'neutral' | 'open';
  defensiveness_triggers: string[];
  engagement_improves_with: string[];
}

// ==================== Disclosure Policy ====================
export interface DisclosurePolicy {
  sensitive_topics: string[];
  likely_minimization: string[];
  empathy_required_topics: string[];
}

// ==================== Treatment Options ====================
export interface TreatmentOption {
  treatment_id: string;
  rationale: string;
}

export interface TreatmentOptions {
  recommended: TreatmentOption[];
  alternatives: TreatmentOption[];
  not_recommended: TreatmentOption[];
}

// ==================== Red Flag Triggers ====================
export interface RedFlagTrigger {
  trigger: string;
  expected_follow_up: string;
}

// ==================== Scoring Blueprint ====================
export interface ScoringBlueprint {
  must_elicit: string[];
  must_rule_out: string[];
  communication_goals: string[];
}

// ==================== Case Metadata ====================
export interface CaseMetadata {
  case_id: string;
  generation_seed: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  setting: string;
  chief_complaint: string;
}

// ==================== Patient Profile Model ====================
@Table({
  tableName: 'patient_profiles',
  timestamps: true,
})
export class PatientProfile extends Model<PatientProfile> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare schema_version: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare case_metadata: CaseMetadata;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare primary_diagnosis: PrimaryDiagnosis;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare rule_out_diagnoses: RuleOutDiagnosis[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare symptoms: PatientSymptom[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare pertinent_negatives: string[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare risk_assessment: RiskAssessment;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare mental_status_audio_only: MentalStatusAudioOnly;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare interaction_style: InteractionStyle;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare disclosure_policy: DisclosurePolicy;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare treatment_options: TreatmentOptions;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare red_flag_triggers: RedFlagTrigger[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare scoring_blueprint: ScoringBlueprint;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare saved: boolean;

  @HasMany(() => GradingChat)
  declare gradingChats: GradingChat[];
}
