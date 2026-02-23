import { GlobalState } from './state';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import z from 'zod';
import { PatientProfile } from '../../../models/patient-profile.model';

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
    });

    // 1️⃣ Get the patient profile from the previous node
    const profile = state.patient_profile;
    if (!profile) throw new Error('Patient profile not loaded in state.');

    // 2️⃣ Collect all previous messages / critiques from graph history
    const historyMessages = state.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 3️⃣ Prepare a structured output schema for grading
    const outputSchema = z.object({
      grade: z.number().min(0).max(100),
      comments: z.string(),
    });

    const structured = model.withStructuredOutput(outputSchema);

    // 4️⃣ Compose a prompt for grading
    const prompt = `
You are a clinical grader evaluating a psychiatrist-clinician interaction.
- The patient profile is: ${JSON.stringify(profile, null, 2)}
- The scoring blueprint is: ${JSON.stringify(profile.scoring_blueprint, null, 2)}
- Previous conversation history: ${JSON.stringify(historyMessages, null, 2)}

Task:
1. Evaluate the interaction based on the patient profile and scoring blueprint.
2. Provide a numeric grade (0-100), a short critique, and remarks/comments for the clinician.

Return ONLY strict JSON: 
{{ grade, comments }}
`;

    // 5️⃣ Run the model
    const result = await structured.invoke([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate grade for this interaction.' },
    ]);

    return {
      final_score: result.grade,
      final_response: result.comments,
      // store grade data for downstream use
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