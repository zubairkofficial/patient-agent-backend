import { GlobalState } from './state';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage } from '@langchain/core/messages';
import z from 'zod';
import { PatientProfile } from '../../../models/patient-profile.model';
import { GradingChat } from 'src/models/grading-chat.model';

async function init(): Promise<ChatOpenAI> {
  // const api = await SuperAdminProfile.findOne({
  //   attributes: ['openai', 'master_prompt'],
  // });

  // if (!api || !api.openai) {
  //   throw new Error('No OpenAI API key found.');
  // }

  return new ChatOpenAI({
    modelName: 'gpt-4o',
    // apiKey: api.openai,
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// ---------------------- Grading-specific nodes ----------------------
export const loadProfileNode = async (state: typeof GlobalState.State) => {
  try {
    const id = state.patientProfileId;

    if (!id) {
      throw new Error('No patient profile id provided in state.');
    }

    const profileData = await PatientProfile.findByPk(id as any);

    if (!profileData) {
      throw new Error('Patient profile not found.');
    }

    const profile = profileData.get
      ? profileData.get({ plain: true })
      : profileData;

    return {
      patient_profile: profile,
      messages: new AIMessage(
        `Patient profile loaded: ${profile.case_metadata?.case_id || 'unknown'}`,
      ),
    };
  } catch (error) {
    throw new Error(
      'Failed to load patient profile. ' + (error as Error).message,
    );
  }
};

export const analyzeMessageNode = async (state: typeof GlobalState.State) => {
  try {
    const model = await init();

    const profile = state.patient_profile;
    const userMessage = state.user_message?.content || '';

    if (!profile) {
      throw new Error('No patient profile present in state for analysis.');
    }

    const outputSchema = z.object({
      score: z.number(),
      critique: z.string(),
      next_response: z.string(),
      // metadata: z.record(z.string(), z.any()).optional(),
    });

    const structured = model.withStructuredOutput(outputSchema);

    const prompt = `You are a clinical grader and patient-simulator. Treat the HUMAN speaker (the clinician/psychiatrist) as the interlocutor, and generate outputs from the perspective of the PATIENT (the agent) when producing the suggested next response.

  Tasks:
  1) Produce a numeric score (-100 to 0 to +100) evaluating how well the clinician's message aligns with the patient's interaction preferences, disclosure policy, red-flag handling, and the scoring blueprint.
  2) Provide a concise critique addressed to the clinician describing strengths, missteps, and any missed opportunities.
  3) Produce a brief suggested NEXT RESPONSE written as the PATIENT (first-person voice) that the agent should reply with—matching the patient's language level, emotional tone, willingness to disclose, and safety constraints. If the clinician's message raises safety concerns (self-harm, intent to harm others, acute distress), ensure the critique flags this and the suggested patient response reflects distress appropriately and does NOT provide instructions for self-harm; include an instruction for the clinician to escalate or offer immediate help.

  Patient Profile JSON:
  ${JSON.stringify(profile, null, 2)}

  Clinician message (from the psychiatrist):
  """
  ${userMessage}
  """

  Return strict JSON with the keys: {{ score, critique, next_response }}
  - score: integer -100 to 0 to +100.
  - critique: 1-3 short sentences, actionable, for the clinician.
  - next_response: a single short paragraph (1-3 sentences) in the patient's voice, suitable to send verbatim as the patient's reply.

  Do not include any additional explanation outside the JSON. Ensure next_response is safe, consistent with the profile, and reflects the agent-as-patient perspective.`;

    const result = await structured.invoke([
      { role: 'system', content: prompt },
      { role: 'user', content: `Please evaluate the clinician message.` },
    ]);

    console.log('Structured output from model:', result.critique);

    const score = result.score ?? 0;
    // const metadata = result.metadata || {};

    return {
      messages: new AIMessage(`${prompt}  result: ${JSON.stringify(result)}`),

      last_score: score,
      // last_metadata: metadata,
      final_response: result.next_response || '',
      // also keep a short analysis for downstream use
      analysis: result.critique || '',
    };
  } catch (error) {
    throw new Error('Failed to analyze message. ' + (error as Error).message);
  }
};

export const gradingResponseNode = async (state: typeof GlobalState.State) => {
  try {
    const {
      final_response,
      last_score,
      gradingChatId,
      // , last_metadata
    } = state;

    const gradingChat = await GradingChat.findByPk(gradingChatId as any);

    if (!gradingChat) {
      throw new Error('Grading chat not found for ID: ' + gradingChatId);
    }
    gradingChat.totalScore =
      (gradingChat.totalScore || 0) + (last_score as number);
    await gradingChat.save();

    return {
      messages: new AIMessage(final_response || 'No response generated.'),
      final_response: final_response || '',
      score: last_score || null,
      // metadata: last_metadata || {},
    };
  } catch (error) {
    throw new Error(
      'Failed in grading response node. ' + (error as Error).message,
    );
  }
};
