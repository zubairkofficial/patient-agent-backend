import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { HumanMessage } from '@langchain/core/messages';
import { getGradingGraph, getGraph } from './agent/agent';
import { GradingChat } from 'src/models/grading-chat.model';
import { ChatMessage } from 'src/models/chat-message.model';
import { AgentChatDTO } from './dto/agentChat.dto';
import { createClient } from '@deepgram/sdk';
import { Server, Socket } from 'socket.io';
import { Readable } from 'stream';
import { Buffer } from 'buffer';

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

  async completeChat(gradingChatId: number, req: any) {
    try {
      const gradingChat = await GradingChat.findByPk(gradingChatId);
      if (!gradingChat) throw new NotFoundException('Grading chat not found');

      const thread_id = `${req.user.sub}-${gradingChatId}`;
      const input = {
        gradingChatId: gradingChat.id,
        patientProfileId: gradingChat.patientProfileId,
        user_id: req.user.id,
      };

      const graph = await getGradingGraph();

      const response = await graph.invoke(input, {
        configurable: { thread_id },
      });

      if (!response?.final_score || !response?.final_response) {
        throw new Error('No grading output generated');
      }

      const parsed_final_response = JSON.parse(response.final_response);
      // Update grading chat with numeric grade + remarks
      await gradingChat.update({
        totalScore: response.final_score,
        agentRemarks: parsed_final_response,
        isCompleted: true,
      });

      return {
        success: true,
        message: 'Grading completed',
        totalScore: response.final_score,
        agentRemarks: parsed_final_response,
      };
    } catch (error) {
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

      await ChatMessage.create({
        gradingChatId: Number(agentDTO.gradingChatId),
        content: agentDTO.content,
        agent: false,
      } as any);

      const thread_id = `${req.user.sub}-${agentDTO.gradingChatId}`;
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
      let userMessageText: string;

      /* ---------------- HANDLE VOICE INPUT ---------------- */
      if (agentDTO.voiceBlob) {
        console.log('🎙️ Voice input detected, transcribing...');

        // Convert ArrayBuffer or base64 from frontend to Buffer
        const audioBuffer = Buffer.from(agentDTO.voiceBlob);

        // Convert Buffer to Readable stream (v3 requires stream or file)
        const audioStream = Readable.from(audioBuffer);

        // v3 transcription
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

        // Send transcription back to frontend
        socket.emit('user-transcribed', userMessageText);
      } else if (agentDTO.content) {
        // Text input
        userMessageText = agentDTO.content;
      } else {
        throw new Error('No valid input provided');
      }

      /* ---------------- SAVE USER MESSAGE ---------------- */
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

      /* ---------------- WAIT FOR FINAL LLM RESPONSE ---------------- */
      const response = await this.app.invoke(input, {
        configurable: { thread_id },
      });

      if (!response.final_response) {
        throw new Error('No final response from supervisor');
      }

      const finalText = response.final_response;

      /* ---------------- SAVE AI MESSAGE ---------------- */
      await ChatMessage.create({
        gradingChatId,
        agent: true,
        content: finalText,
      } as any);

      /* ---------------- EMIT RESPONSE ---------------- */
      socket.emit('agent-final', finalText);

      /* ---------------- CONDITIONAL TTS FOR VOICE INPUT ---------------- */
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

        // Check type of dgResponse.result
        let ttsAudioBuffer: Buffer;

        // v3 SDK: result might be Uint8Array
        if (dgResponse.result instanceof Uint8Array) {
          ttsAudioBuffer = Buffer.from(dgResponse.result);
        }
        // If it's already a Node Buffer
        else if (Buffer.isBuffer(dgResponse.result)) {
          ttsAudioBuffer = dgResponse.result;
        }
        // Fallback for ArrayBuffer
        else if (dgResponse.result.arrayBuffer) {
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
