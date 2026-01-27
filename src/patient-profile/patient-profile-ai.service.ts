import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Symptoms } from '../models/symptoms.model';
import { Treatments } from '../models/treatments.model';
import { Diagnosis } from '../models/diagnosis.model';
import {
  GeneratedPatientProfileSchema,
  type GeneratedPatientProfile,
} from './schemas/patient-profile.schema';

interface PatientProfileInput {
  diagnosis_id: number;
  chief_complaint: string;
}

@Injectable()
export class PatientProfileAiService {
  constructor(
    @InjectModel(Symptoms)
    private symptomsModel: typeof Symptoms,
    @InjectModel(Treatments)
    private treatmentsModel: typeof Treatments,
    @InjectModel(Diagnosis)
    private diagnosisModel: typeof Diagnosis,
  ) {}

  async generatePatientProfile(
    input: PatientProfileInput,
  ): Promise<GeneratedPatientProfile> {
    try {
      // Fetch diagnosis details
      const diagnosis = await this.diagnosisModel.findByPk(input.diagnosis_id);
      if (!diagnosis) {
        throw new BadRequestException(
          `Diagnosis with ID ${input.diagnosis_id} not found`,
        );
      }

      // Fetch all symptoms from database
      const dbSymptoms = await this.symptomsModel.findAll();
      const symptomMap = new Map(dbSymptoms.map((s) => [s.id.toString(), s]));

      // Fetch all treatments from database
      const dbTreatments = await this.treatmentsModel.findAll();
      const treatmentMap = new Map(dbTreatments.map((t) => [t.id.toString(), t]));

      // Fetch all diagnoses for rule-out section
      const allDiagnoses = await this.diagnosisModel.findAll();
      const diagnosisMap = new Map(allDiagnoses.map((d) => [d.id, d]));

      // Build prompt for OpenAI
      const prompt = this.buildPrompt(
        diagnosis.name,
        input.chief_complaint,
        dbSymptoms,
        dbTreatments,
        allDiagnoses,
      );

      // Call OpenAI API via LangChain
      const aiResponse = await this.callOpenAI(prompt);

      // Parse and validate response against Zod schema
      const parsedResponse = JSON.parse(aiResponse);

      // Add db_present flags for items not found in database
      const enrichedResponse = this.enrichWithDbPresenceFlags(
        parsedResponse,
        symptomMap,
        treatmentMap,
        diagnosisMap,
      );

      // Validate against schema
      const validatedProfile =
        GeneratedPatientProfileSchema.parse(enrichedResponse);

      return validatedProfile;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Failed to parse AI response as JSON');
      }
      throw error;
    }
  }

  private buildPrompt(
    diagnosisName: string,
    chiefComplaint: string,
    dbSymptoms: any[],
    dbTreatments: any[],
    dbDiagnoses: any[],
  ): string {
    const symptomsJson = dbSymptoms
      .map((s) => `- ${s.id}: ${s.name}`)
      .join('\n');
    const treatmentsJson = dbTreatments
      .map((t) => `- ${t.id}: ${t.name}`)
      .join('\n');
    const diagnosesJson = dbDiagnoses
      .map((d) => `- ${d.id}: ${d.name}`)
      .join('\n');

    return `You are a psychiatric diagnostic expert. Generate a comprehensive patient profile JSON response based on the following information:

Primary Diagnosis: ${diagnosisName}
Chief Complaint: "${chiefComplaint}"

AVAILABLE SYMPTOMS IN DATABASE:
${symptomsJson}

AVAILABLE TREATMENTS IN DATABASE:
${treatmentsJson}

AVAILABLE DIAGNOSES IN DATABASE:
${diagnosesJson}

Generate a detailed patient profile JSON matching this structure:
{
  "schema_version": "1.0",
  "case_metadata": {
    "case_id": "string (e.g., MDD_REC_MOD_001)",
    "generation_seed": number,
    "difficulty": "easy" | "moderate" | "hard",
    "setting": "outpatient" | "inpatient" | "telehealth",
    "chief_complaint": "${chiefComplaint}"
  },
  "primary_diagnosis": {
    "dx_id": number,
    "name": "${diagnosisName}",
    "confidence": "high" | "moderate" | "low",
    "rationale": "string"
  },
  "rule_out_diagnoses": [
    {
      "dx_id": number,
      "name": "string",
      "why_ruled_out": "string"
    }
  ],
  "symptoms": [
    {
      "symptom_id": "string",
      "present": boolean,
      "severity": number (0-3),
      "disclosure_rules": {
        "spontaneous": boolean,
        "requires_open": boolean,
        "requires_direct": boolean,
        "requires_normalization": boolean,
        "requires_empathy_first": boolean
      }
    }
  ],
  "pertinent_negatives": ["string"],
  "risk_assessment": {
    "suicide_risk": {
      "passive_death_wish": boolean,
      "active_ideation": boolean,
      "plan": boolean,
      "intent": boolean,
      "protective_factors": ["string"]
    },
    "homicide_risk": boolean
  },
  "mental_status_audio_only": {
    "speech": "string",
    "mood": "string",
    "affect": "string",
    "thought_process": "string",
    "thought_content": "string",
    "perception": "string",
    "cognition": "string",
    "insight": "string",
    "judgment": "string"
  },
  "interaction_style": {
    "verbosity": "low" | "moderate" | "high",
    "affect_style": "string",
    "trust_baseline": "guarded" | "neutral" | "open",
    "defensiveness_triggers": ["string"],
    "engagement_improves_with": ["string"]
  },
  "disclosure_policy": {
    "sensitive_topics": ["string"],
    "likely_minimization": ["string"],
    "empathy_required_topics": ["string"]
  },
  "treatment_options": {
    "recommended": [
      {
        "treatment_id": "string",
        "rationale": "string"
      }
    ],
    "alternatives": [
      {
        "treatment_id": "string",
        "rationale": "string"
      }
    ],
    "not_recommended": [
      {
        "treatment_id": "string",
        "rationale": "string"
      }
    ]
  },
  "red_flag_triggers": [
    {
      "trigger": "string",
      "expected_follow_up": "string"
    }
  ],
  "scoring_blueprint": {
    "must_elicit": ["string"],
    "must_rule_out": ["string"],
    "communication_goals": ["string"]
  }
}

IMPORTANT INSTRUCTIONS:
1. Symptoms severity must be between 0-3
2. Use the available symptoms and treatments from the database when possible
3. If you need to add symptoms/treatments/diagnoses not in the database, you may do so but mark them appropriately
4. Generate realistic and clinically coherent profiles
5. Return ONLY valid JSON, no additional text
6. Ensure all required fields are present`;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    // TODO: Implement actual LangChain + OpenAI API call
    // This requires: npm install langchain @langchain/openai
    // For now, returning a mock response
    console.log('Calling OpenAI with prompt:', prompt);
    throw new Error('OpenAI integration not yet implemented. Please install langchain and @langchain/openai');
  }

  private enrichWithDbPresenceFlags(
    profile: any,
    symptomMap: Map<string, any>,
    treatmentMap: Map<string, any>,
    diagnosisMap: Map<number, any>,
  ): any {
    // Mark symptoms with db_present flag
    if (profile.symptoms && Array.isArray(profile.symptoms)) {
      profile.symptoms = profile.symptoms.map((symptom: any) => ({
        ...symptom,
        db_present: symptomMap.has(symptom.symptom_id),
      }));
    }

    // Mark rule_out diagnoses with db_present flag
    if (profile.rule_out_diagnoses && Array.isArray(profile.rule_out_diagnoses)) {
      profile.rule_out_diagnoses = profile.rule_out_diagnoses.map(
        (rulOut: any) => ({
          ...rulOut,
          db_present: diagnosisMap.has(rulOut.dx_id),
        }),
      );
    }

    // Mark primary diagnosis with db_present flag
    if (profile.primary_diagnosis) {
      profile.primary_diagnosis = {
        ...profile.primary_diagnosis,
        db_present: diagnosisMap.has(profile.primary_diagnosis.dx_id),
      };
    }

    // Mark treatment options with db_present flag
    if (profile.treatment_options) {
      const enrichTreatments = (treatments: any[]) =>
        treatments.map((treatment: any) => ({
          ...treatment,
          db_present: treatmentMap.has(treatment.treatment_id),
        }));

      profile.treatment_options = {
        recommended: enrichTreatments(
          profile.treatment_options.recommended || [],
        ),
        alternatives: enrichTreatments(
          profile.treatment_options.alternatives || [],
        ),
        not_recommended: enrichTreatments(
          profile.treatment_options.not_recommended || [],
        ),
      };
    }

    return profile;
  }
}
