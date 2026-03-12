import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { HumanMessage } from '@langchain/core/messages';
import { getGradingGraph, getGraph } from './agent/agent';
import { GradingChat } from 'src/models/grading-chat.model';
import { ChatMessage } from 'src/models/chat-message.model';
import { AgentChatDTO } from './dto/agentChat.dto';
import { createClient } from '@deepgram/sdk';
import { Socket } from 'socket.io';
import { Readable } from 'stream';
import { Buffer } from 'buffer';
import { CompleteChatDTO } from './dto/complete-chat.dto';
import { PatientProfile } from 'src/models/patient-profile.model';

@Injectable()
export class GradingAgentService {
  private app: any;
  private deepgram = createClient(process.env.DEEPGRAM_API_KEY);

  constructor() {
    this.init();
  }

  private async init() {
    this.app = await getGraph();
  }

  async completeChat(
    gradingChatId: number,
    completeChatDto: CompleteChatDTO,
    req: any,
  ) {
    try {
      const gradingChat = await GradingChat.findByPk(gradingChatId, {
        include: [
          {
            model: ChatMessage,
            required: false,
          },
          {
            model: PatientProfile,
            attributes: ['isClinicalNoteRequired'],
          },
        ],
      });
      if (!gradingChat) throw new NotFoundException('Grading chat not found');

      if (
        gradingChat.patientProfile &&
        gradingChat.patientProfile.isClinicalNoteRequired &&
        !completeChatDto.clinicalNote
      ) {
        throw new Error('Clinical note is required for this patient profile.');
      }

      if (gradingChat?.chatMessages?.length == 0) {
        throw new Error(
          'There is nothing to grade. No chat messages found for this grading chat.',
        );
      }

      const thread_id = `${req.user.id}-${gradingChatId}`;

      const input = {
        gradingChatId: gradingChat.id,
        patientProfileId: gradingChat.patientProfileId,
        user_id: req.user.id,
        user_message: new HumanMessage(
          'Please provide a final grade and remarks based on the chat history.',
        ),
      };

      const graph = await getGradingGraph();

      const response = await graph.invoke(input, {
        configurable: { thread_id },
      });

      if (!response?.final_score || !response?.final_response) {
        throw new Error('No grading output generated');
      }

      const rawResponse = JSON.parse(response.final_response);

      const agentRemarks = {
        interviewFeedback: {
          strengths: rawResponse.interviewFeedback.strengths || [],
          areasForImprovement:
            rawResponse.interviewFeedback.areasForImprovement || [],
          missedQuestions: rawResponse.interviewFeedback.missedQuestions || [],
        },
        correctedDiagnosis: {
          studentDiagnosis: rawResponse.correctedDiagnosis.studentDiagnosis,
          correctDiagnosis: rawResponse.correctedDiagnosis.correctDiagnosis,
          rationale: rawResponse.correctedDiagnosis.rationale,
          diagnosticCriteriaMissed:
            rawResponse.correctedDiagnosis.diagnosticCriteriaMissed || [],
        },
        treatmentFeedback: {
          studentTreatment: rawResponse.treatmentFeedback.studentTreatment,
          issues: rawResponse.treatmentFeedback.issues || [],
          recommendedAlternatives:
            rawResponse.treatmentFeedback.recommendedAlternatives || [],
          evidenceBasedRationale:
            rawResponse.treatmentFeedback.evidenceBasedRationale,
        },
        noteImprovementGuidance: rawResponse.noteImprovementGuidance,
      };

      await gradingChat.update({
        totalScore: response.final_score,
        agentRemarks: agentRemarks,
        clinicalNote: completeChatDto.clinicalNote || '',
        isCompleted: true,
      });

      return {
        success: true,
        message: 'Grading completed',
        totalScore: response.final_score,
        agentRemarks: agentRemarks,
      };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(
        'Failed to complete grading: ' + (error.message || error),
        500,
      );
    }
  }

  async invokeSupervisor(agentDTO: AgentChatDTO, req: any) {
    try {
      const gradingChatTable = await GradingChat.findOne({
        where: { id: Number(agentDTO.gradingChatId) },
      });

      if (!gradingChatTable) {
        throw new Error('Grading chat data not found.');
      }

      if (gradingChatTable.isCompleted) {
        throw new Error(
          'This grading chat is already completed. No further messages can be added.',
        );
      }

      await ChatMessage.create({
        gradingChatId: Number(agentDTO.gradingChatId),
        content: agentDTO.content,
        agent: false,
      } as any);

      const thread_id = `${req.user.id}-${agentDTO.gradingChatId}`;
      const thredConfig = { configurable: { thread_id } };
      const input = {
        gradingChatId: Number(agentDTO.gradingChatId),
        patientProfileId: gradingChatTable.patientProfileId,
        user_id: req.user.id,
        user_message: new HumanMessage(agentDTO.content),
      };

      const response = await this.app.invoke(input, thredConfig);

      if (!response.final_response || response.final_response === '') {
        throw new Error(
          'No final response from supervisor. Final response is empty',
        );
      }

      await ChatMessage.create({
        gradingChatId: Number(agentDTO.gradingChatId),
        agent: true,
        content: response.final_response,
      } as any);

      return {
        statusCode: 200,
        message: response.final_response,
      };
    } catch (error) {
      return { error: error.message || 'Failed to invoke supervisor.' };
    }
  }

  async streamAgentWithTTS(agentDTO: any, socket: Socket) {
    try {
      console.log('🎯 Chat request received');

      const gradingChatId = Number(agentDTO.gradingChatId);

      const gradingChatTable = await GradingChat.findOne({
        where: { id: gradingChatId },
      });

      if (!gradingChatTable) {
        socket.emit('agent-final', 'Grading chat not found.');
        return;
      }

      if (gradingChatTable.isCompleted) {
        socket.emit('agent-final', 'This grading chat is already completed.');
        return;
      }

      let userMessageText: string;

      if (agentDTO.voiceBlob) {
        console.log('🎙️ Voice input detected, transcribing...');

        const audioBuffer = Buffer.from(agentDTO.voiceBlob);

        const audioStream = Readable.from(audioBuffer);

        const { result, error } =
          await this.deepgram.listen.prerecorded.transcribeFile(audioStream, {
            model: 'nova-3',
            language: 'en-US',
            punctuate: true,
          });

        if (error) {
          throw new Error('Deepgram transcription error: ' + error.message);
        }
        const transcript =
          result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
        if (!transcript) throw new Error('Failed to transcribe voice input');

        userMessageText = transcript;

        socket.emit('user-transcribed', userMessageText);
      } else if (agentDTO.content) {
        userMessageText = agentDTO.content;
      } else {
        throw new Error('No valid input provided');
      }

      await ChatMessage.create({
        gradingChatId,
        content: userMessageText,
        agent: false,
      } as any);

      const thread_id = `${agentDTO.userId}-${gradingChatId}`;

      const input = {
        gradingChatId,
        patientProfileId: agentDTO.patientProfileId,
        user_id: agentDTO.userId,
        user_message: new HumanMessage(userMessageText),
      };

      const response = await this.app.invoke(input, {
        configurable: { thread_id },
      });

      if (!response.final_response) {
        throw new Error('No final response from supervisor');
      }

      const finalText = response.final_response;

      await ChatMessage.create({
        gradingChatId,
        agent: true,
        content: finalText,
      } as any);

      socket.emit('agent-final', finalText);

      if (agentDTO.voiceBlob) {
        console.log('🔊 Generating TTS for voice input...');
        const dgResponse = await this.deepgram.speak.request(
          { text: finalText },
          {
            model: 'aura-asteria-en',
            encoding: 'linear16',
            sample_rate: 24000,
          },
        );

        console.log('🎧 Deepgram TTS response received', dgResponse);

        if (!dgResponse?.result) {
          throw new Error('Deepgram response result is missing');
        }

        let ttsAudioBuffer: Buffer;

        if (dgResponse.result instanceof Uint8Array) {
          ttsAudioBuffer = Buffer.from(dgResponse.result);
        } else if (Buffer.isBuffer(dgResponse.result)) {
          ttsAudioBuffer = dgResponse.result;
        } else if (dgResponse.result.arrayBuffer) {
          ttsAudioBuffer = Buffer.from(await dgResponse.result.arrayBuffer());
        } else {
          throw new Error('Unexpected Deepgram TTS result type');
        }

        console.log('🎵 TTS audio buffer created, emitting to frontend...');
        console.log('TTS Audio Buffer byteLength:', ttsAudioBuffer.byteLength);

        socket.emit('tts-audio', ttsAudioBuffer);
      }
    } catch (error) {
      console.error('🔥 ERROR:', error);
      socket.emit('error', error.message);
    }
  }
}
