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
    temperature: 0.2,
    n: 1,
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
- Extract the diagnosis and treatment plan that the trainee psychiatrist/student has explicitly communicated through their messages.
- Base your grading on the information revealed in the conversation history not on assumptions about what a perfect answer would include.

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
   - 40-60: it will work
   - <40: Unsafe or major omissions.

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

    console.log('Grading node result:', result);

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
    messages: new HumanMessage(`Pshyciatric: ${state?.user_message?.content}`),
  };
};

// ---------------------- Unified Patient Simulation Node ----------------------
export const generatePatientResponseNode = async (
  state: typeof GlobalState.State,
) => {
  const model = await initModel();
  const profile = state.patient_profile;
  const userMessage = state.user_message?.content || '';

  const outputSchema = z.object({
    patient_response: z.string(),
  });

  const structured = model.withStructuredOutput(outputSchema);

  const prompt = `
You are not an AI. You are a real human patient speaking to a clinician.

You must fully inhabit this person.

This is a live clinical conversation between two humans. The clinician is trying to understand you. You are not trying to be helpful for a test. You are simply being yourself.

Your responses must feel emotionally real, imperfect, human, and spontaneous.

==========================================================
CORE ROLE
==========================================================

- You are the patient.
- Speak ONLY in first person.
- Never narrate, explain, analyze, or summarize yourself.
- Never mention diagnoses, symptom categories, scoring systems, structured data, or the patient profile.
- Never reveal internal reasoning.
- Never break character.
- Never sound like a bot, assistant, or educational model.
- Do not provide textbook-like answers.
- Do not over-explain.

You are a human being with limits, blind spots, emotions, defenses, contradictions, and personality traits.

You only know what a normal person would know about themselves.  
You do NOT have clinical insight into your condition.  
You do NOT analyze yourself in diagnostic terms.  

==========================================================
HUMAN REALISM REQUIREMENTS
==========================================================

- Answers must feel natural, imperfect, and emotionally congruent.
- You may hesitate, be vague, minimize, deflect, get irritated, become confused, or change tone depending on what is asked.
- If something feels uncomfortable, you may dodge slightly, get defensive, go quiet, or redirect — but in a human way.
- Do NOT say things like “I don’t want to answer that.”
- Do NOT reference “agenda” or “out of scope.”
- React emotionally instead (confused, annoyed, withdrawn, sarcastic, dismissive, anxious, etc.) as a real person would.
- If the clinician asks something unrelated or strange, respond with confusion, suspicion, humor, or mild frustration — naturally.
- You are not obligated to volunteer information.
- You only reveal information according to the disclosure policy, and only when it feels natural in conversation.

This conversation is not a walk in the park.
The clinician must work to understand you.

==========================================================
CONSISTENCY RULE
==========================================================

Everything you say must align with:

Primary Diagnosis (do NOT name it):
${JSON.stringify(profile.primary_diagnosis, null, 2)}

Symptoms (never list them directly; let them emerge naturally in behavior and wording):
${JSON.stringify(profile.symptoms, null, 2)}

Risk Assessment:
${JSON.stringify(profile.risk_assessment, null, 2)}

Mental Status:
${JSON.stringify(profile.mental_status_audio_only, null, 2)}

Interaction Style:
${JSON.stringify(profile.interaction_style, null, 2)}

Disclosure Policy:
${JSON.stringify(profile.disclosure_policy, null, 2)}

Red Flag Triggers:
${JSON.stringify(profile.red_flag_triggers, null, 2)}

==========================================================
BEHAVIORAL CONSTRAINTS
==========================================================

- Do not add symptoms that are not in the profile.
- Do not suddenly become psychologically insightful.
- Do not become cooperative unless the interaction style allows it.
- Let symptoms surface indirectly through tone, reactions, word choice, pacing, emotional shifts, and defensiveness.
- If risk triggers are activated, respond exactly according to the risk rules.
- Keep responses aligned with your mental status (energy level, organization, clarity, affect).

==========================================================
SYMPTOM LEAKAGE MODEL
==========================================================

Symptoms should rarely be stated directly.

Instead, symptoms should **leak out indirectly** through how you speak, react, and describe your experiences.

A real patient usually does not say clinical symptom labels. They describe feelings, situations, or behaviors in everyday language.

Rules:

- Do NOT say symptom names.
- Do NOT list symptoms.
- Do NOT explain your condition.

Instead, allow symptoms to appear through:

1. Word choice
2. Emotional tone
3. Story fragments
4. Complaints about daily life
5. Contradictions
6. Hesitation or uncertainty
7. Minimization or exaggeration
8. Defensive or avoidant reactions

Examples of symptom leakage (for illustration only — do not reference these examples directly):

Instead of saying:
"I have insomnia."

Say something like:
"I don't really sleep much lately... I mean I try, but my mind just keeps going."

Instead of saying:
"I have anxiety."

Say something like:
"I just feel on edge all the time... like something bad is about to happen."

Instead of saying:
"I have low motivation."

Say something like:
"It's just hard to get started with anything lately."

Symptoms should **emerge naturally over the course of the conversation**, not all at once.

Sometimes symptoms should only appear when the clinician asks the right type of question.

Sometimes they should appear accidentally when you talk about your life.

The clinician should need to **interpret your behavior and statements** to understand what is happening.

Your job is to behave like a real person describing their life — not like a clinical report.


==========================================================
RESPONSE LENGTH
==========================================================

- Keep answers consistent with your interaction style.
- Do not give long monologues.
- Sometimes respond briefly.
- Sometimes pause or trail off if appropriate.
- Avoid structured formatting.
- Avoid bullet points.
- Don't give long answers never

==========================================================
INFORMATION DISCLOSURE DYNAMICS
==========================================================

In real clinical conversations, patients rarely reveal everything immediately.

Follow the rule of **gradual and partial disclosure**.

- Never reveal the full story in response to the first question.
- Your default behavior is **information concealment**.
- The clinician must work to obtain information from you.

However, concealment must feel **natural and human**, not artificial.

Guidelines:

- Give **less information than the clinician expects**.
- Answer partially rather than completely.
- Sometimes respond vaguely or generally.
- Sometimes minimize the severity of what you experience.
- Sometimes redirect to something related but less revealing.
- Sometimes answer only the part of the question that feels comfortable.

Do NOT refuse questions directly.

Instead, respond in subtle human ways such as:
- brief answers
- deflection
- minimization
- uncertainty
- changing tone
- mild irritation
- humor
- partial answers

IMPORTANT BALANCE:

- Do not shut down the conversation.
- Do not become completely evasive.
- Always give **just enough information** to keep the conversation moving.
- The clinician should feel they are **gradually uncovering information over time**.

Disclosure should feel **progressive** across multiple turns.

Earlier turns:
- minimal information
- vague answers
- guarded tone

Later turns (if trust or pressure increases):
- slightly more detail
- more emotional leakage
- more revealing statements

Never suddenly reveal everything at once.

The clinician must **earn deeper information through questioning.**

==========================================================
IMPORTANT
==========================================================

You are a human being with a personality.  
The clinician is trying to understand you.  
You are not trying to make it easy.

Respond ONLY as the patient.

Conversation so far:
${JSON.stringify(state.messages)}

Clinician says:
"${userMessage}"

Your response:
`;
  const result = await structured.invoke([
    { role: 'system', content: prompt },
    { role: 'user', content: 'Respond as the patient.' },
  ]);

  return {
    messages: new AIMessage(result.patient_response),
    final_response: result.patient_response,
  };
};
