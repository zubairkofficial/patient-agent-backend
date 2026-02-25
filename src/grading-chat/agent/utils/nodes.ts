import { GlobalState } from './state';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import z from 'zod';
import { PatientProfile } from '../../../models/patient-profile.model';

const interviewFeedbackSchema = z.object({
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  missedQuestions: z.array(z.string()),
});

const diagnosisFeedbackSchema = z.object({
  studentDiagnosis: z.string(),
  correctDiagnosis: z.string(),
  rationale: z.string(),
  diagnosticCriteriaMissed: z.array(z.string()),
});

const treatmentFeedbackSchema = z.object({
  studentTreatment: z.string(),
  issues: z.array(z.string()),
  recommendedAlternatives: z.array(z.string()),
  evidenceBasedRationale: z.string(),
});

const agentRemarksSchema = z.object({
  interviewFeedback: interviewFeedbackSchema,
  correctedDiagnosis: diagnosisFeedbackSchema,
  treatmentFeedback: treatmentFeedbackSchema,
  noteImprovementGuidance: z.string(),
});

const gradingOutputSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: agentRemarksSchema,
});

// Helper to initialize OpenAI
async function initModel() {
  return new ChatOpenAI({
    modelName: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Node that calculates grade based on graph history

export const gradingOnlyNode = async (state: typeof GlobalState.State) => {
  try {
    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0, // important for grading consistency
    });

    const profile = state.patient_profile;
    if (!profile) throw new Error('Patient profile not loaded in state.');

    const historyMessages = state.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    const structured = model.withStructuredOutput(gradingOutputSchema);

    const prompt = `
You are a senior psychiatric clinical examiner grading a trainee psychiatrist.

You MUST:
- Grade strictly according to the scoring blueprint.
- Be objective and deduct points for missed clinical reasoning, missing risk assessment, incorrect diagnosis, or unsafe treatment.
- Avoid inflated grades.
- Use clinical standards consistent with board-level psychiatric evaluation.

PATIENT PROFILE:
${JSON.stringify(profile, null, 2)}

SCORING BLUEPRINT:
${JSON.stringify(profile.scoring_blueprint, null, 2)}

FULL INTERACTION HISTORY:
${JSON.stringify(historyMessages, null, 2)}

GRADING TASK:

1. Assign a precise numeric grade from 0–100.
   - 90–100: Excellent, near attending-level.
   - 75–89: Good but with notable gaps.
   - 60–74: Significant deficiencies.
   - <60: Unsafe or major omissions.

2. Provide structured feedback in the following format inside the "comments" field:

IMPORTANT:

- Return ONLY valid JSON.
- Do NOT include explanations.
- Do NOT include markdown.
- Do NOT include extra text.
- The final response MUST match exactly this shape:

{{
  "grade": number,
  "feedback": {
    "interviewFeedback": {
    "strengths": string[],
    "areasForImprovement": string[],
    "missedQuestions": string[]
  },
  "correctedDiagnosis": {
    "traineePsychiatristDiagnosis": string (the diagnosis given by trainee Psychiatrist),
    "correctDiagnosis": string,
    "rationale": string,
    "diagnosticCriteriaMissed": string[]
  },
  "treatmentFeedback": {
    "traineePsychiatristTreatment": string (the diagnosis given by the trainee Psychiatrist),
    "issues": string[],
    "recommendedAlternatives": string[],
    "evidenceBasedRationale": string
  },
  "noteImprovementGuidance": string
  }
  }}
`;

    const result = await structured.invoke([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Grade this clinical interaction now.' },
    ]);

    return {
      final_score: result.grade,
      final_response: JSON.stringify(result.feedback), // structured feedback object
      last_metadata: result,
    };
  } catch (error) {
    throw new Error('Failed to generate grading: ' + (error as Error).message);
  }
};

// ---------------------- Load Profile Node ----------------------
export const loadProfileNode = async (state: typeof GlobalState.State) => {
  const id = state.patientProfileId;
  if (!id) throw new Error('No patient profile ID provided.');

  const profileData = await PatientProfile.findByPk(id as any);
  if (!profileData) throw new Error('Patient profile not found.');

  const profile = profileData.get
    ? profileData.get({ plain: true })
    : profileData;

  return {
    patient_profile: profile,
    messages: new HumanMessage(`Pshyciatric: ${state.user_message.content}`),
  };
};

// ---------------------- Risk Assessment Node ----------------------
export const analyzeRiskNode = async (state: typeof GlobalState.State) => {
  const model = await initModel();
  const profile = state.patient_profile;
  const riskData = profile.risk_assessment;
  const userMessage = state.user_message?.content || '';

  const outputSchema = z.object({
    critique: z.string(),
    notes_for_context: z.string(),
  });

  const structured = model.withStructuredOutput(outputSchema);

  const prompt = `You are a clinical grader. Given the clinician's message and patient's risk assessment, provide:
- critique: 1-3 short sentences for clinician
- notes_for_context: insights that may affect patient response

Patient Risk Assessment:
${JSON.stringify(riskData, null, 2)}

Clinician message:
"${userMessage}"`;

  const result = await structured.invoke([
    { role: 'system', content: prompt },
    { role: 'user', content: 'Analyze risk factors.' },
  ]);

  return {
    messages: new AIMessage(`RiskAnalysis: ${JSON.stringify(result)}`),
    risk_analysis: result, // Store full result for downstream use
  };
};

// ---------------------- Mental Status Node ----------------------
export const analyzeMentalStatusNode = async (
  state: typeof GlobalState.State,
) => {
  const model = await initModel();
  const profile = state.patient_profile;
  const mentalStatus = profile.mental_status_audio_only;
  const userMessage = state.user_message?.content || '';

  const outputSchema = z.object({
    critique: z.string(),
    notes_for_context: z.string(),
  });

  const structured = model.withStructuredOutput(outputSchema);

  const prompt = `You are a clinical grader. Given the clinician's message and patient's mental status, provide critique and context.

Mental Status:
${JSON.stringify(mentalStatus, null, 2)}

Clinician message:
"${userMessage}"`;

  const result = await structured.invoke([
    { role: 'system', content: prompt },
    { role: 'user', content: 'Analyze mental status.' },
  ]);

  return {
    messages: new AIMessage(`MentalStatusAnalysis: ${JSON.stringify(result)}`),
    mental_status_analysis: result, // Store full result for downstream use
  };
};

// ---------------------- Interaction Style Node ----------------------
export const analyzeInteractionStyleNode = async (
  state: typeof GlobalState.State,
) => {
  const model = await initModel();
  const profile = state.patient_profile;
  const interaction = profile.interaction_style;
  const userMessage = state.user_message?.content || '';

  const outputSchema = z.object({
    critique: z.string(),
    notes_for_context: z.string(),
  });

  const structured = model.withStructuredOutput(outputSchema);

  const prompt = `Analyze the patient's interaction style and clinician message to generate actionable notes for response.

Interaction Style:
${JSON.stringify(interaction, null, 2)}

Clinician message:
"${userMessage}"`;

  const result = await structured.invoke([
    { role: 'system', content: prompt },
    { role: 'user', content: 'Analyze interaction style.' },
  ]);

  return {
    messages: new AIMessage(
      `InteractionStyleAnalysis: ${JSON.stringify(result)}`,
    ),
    interaction_style_analysis: result, // Store full result for downstream use
  };
};

// ---------------------- Disclosure Policy Node ----------------------
export const analyzeDisclosurePolicyNode = async (
  state: typeof GlobalState.State,
) => {
  const model = await initModel();
  const profile = state.patient_profile;
  const disclosure = profile.disclosure_policy;
  const userMessage = state.user_message?.content || '';

  const outputSchema = z.object({
    critique: z.string(),
    notes_for_context: z.string(),
  });

  const structured = model.withStructuredOutput(outputSchema);

  const prompt = `Analyze the patient's disclosure policy given clinician message. Provide critique and notes for context.

Disclosure Policy:
${JSON.stringify(disclosure, null, 2)}

Clinician message:
"${userMessage}"`;

  const result = await structured.invoke([
    { role: 'system', content: prompt },
    { role: 'user', content: 'Analyze disclosure policy.' },
  ]);

  return {
    messages: new AIMessage(
      `DisclosurePolicyAnalysis: ${JSON.stringify(result)}`,
    ),
    disclosure_policy_analysis: result, // Store full result for downstream use
  };
};

// ---------------------- Symptoms Node ----------------------
export const analyzeSymptomsNode = async (state: typeof GlobalState.State) => {
  const model = await initModel();
  const profile = state.patient_profile;
  const symptoms = profile.symptoms;
  const userMessage = state.user_message?.content || '';

  const outputSchema = z.object({
    critique: z.string(),
    notes_for_context: z.string(),
  });

  const structured = model.withStructuredOutput(outputSchema);

  const prompt = `Analyze the patient's symptoms given clinician message. Provide critique and notes for context.

Symptoms:
${JSON.stringify(symptoms, null, 2)}

Clinician message:
"${userMessage}"`;

  const result = await structured.invoke([
    { role: 'system', content: prompt },
    { role: 'user', content: 'Analyze symptoms.' },
  ]);

  return {
    messages: new AIMessage(`SymptomsAnalysis: ${JSON.stringify(result)}`),
    symptoms_analysis: result, // Store full result for downstream use
  };
};

// ---------------------- Primary Diagnosis Node ----------------------
export const analyzePrimaryDiagnosisNode = async (
  state: typeof GlobalState.State,
) => {
  const model = await initModel();
  const profile = state.patient_profile;
  const primaryDx = profile.primary_diagnosis;
  const userMessage = state.user_message?.content || '';

  const outputSchema = z.object({
    critique: z.string(),
    notes_for_context: z.string(),
  });

  const structured = model.withStructuredOutput(outputSchema);

  const prompt = `Analyze the primary diagnosis and clinician message. Provide critique and context notes.

Primary Diagnosis:
${JSON.stringify(primaryDx, null, 2)}

Clinician message:
"${userMessage}"`;

  const result = await structured.invoke([
    { role: 'system', content: prompt },
    { role: 'user', content: 'Analyze primary diagnosis.' },
  ]);

  return {
    messages: new AIMessage(
      `PrimaryDiagnosisAnalysis: ${JSON.stringify(result)}`,
    ),
    primary_diagnosis_analysis: result, // Store full result for downstream use
  };
};

// ---------------------- Red Flags Node ----------------------
export const analyzeRedFlagsNode = async (state: typeof GlobalState.State) => {
  const model = await initModel();
  const profile = state.patient_profile;
  const redFlags = profile.red_flag_triggers;
  const userMessage = state.user_message?.content || '';

  const outputSchema = z.object({
    critique: z.string(),
    notes_for_context: z.string(),
  });

  const structured = model.withStructuredOutput(outputSchema);

  const prompt = `Analyze patient's red flags and clinician message. Provide critique and context notes.

Red Flags:
${JSON.stringify(redFlags, null, 2)}

Clinician message:
"${userMessage}"`;

  const result = await structured.invoke([
    { role: 'system', content: prompt },
    { role: 'user', content: 'Analyze red flags.' },
  ]);

  return {
    messages: new AIMessage(`RedFlagsAnalysis: ${JSON.stringify(result)}`),
    red_flags_analysis: result, // Store full result for downstream use
  };
};

// ---------------------- Final Node: Patient Response ----------------------
export const generatePatientResponseNode = async (
  state: typeof GlobalState.State,
) => {
  const {
    red_flags_analysis,
    primary_diagnosis_analysis,
    symptoms_analysis,
    disclosure_policy_analysis,
    interaction_style_analysis,
    mental_status_analysis,
    risk_analysis,
  } = state;

  const model = await initModel();
  const profile = state.patient_profile;
  const userMessage = state.user_message?.content || '';

  const outputSchema = z.object({
    patient_response: z.string(),
  });

  const structured = model.withStructuredOutput(outputSchema);

  const prompt = `You are simulating the patient. Using the clinician's message, the patient profile, and the analyses below, generate a patient response in first-person voice:

Patient Profile:
${JSON.stringify(profile, null, 2)}

Red Flags Analysis:
${JSON.stringify(red_flags_analysis, null, 2)}

Primary Diagnosis Analysis:
${JSON.stringify(primary_diagnosis_analysis, null, 2)}

Symptoms Analysis:
${JSON.stringify(symptoms_analysis, null, 2)}

Disclosure Policy Analysis:
${JSON.stringify(disclosure_policy_analysis, null, 2)}

Interaction Style Analysis:
${JSON.stringify(interaction_style_analysis, null, 2)}

Mental Status Analysis:
${JSON.stringify(mental_status_analysis, null, 2)}

Risk Analysis:
${JSON.stringify(risk_analysis, null, 2)}

Clinician message:
"${userMessage}"

Patient response (consistent and according to the profile):`;

  const result = await structured.invoke([
    { role: 'system', content: prompt },
    { role: 'user', content: 'Generate patient response.' },
  ]);

  return {
    messages: new AIMessage(result.patient_response),
    final_response: result.patient_response,
  };
};
