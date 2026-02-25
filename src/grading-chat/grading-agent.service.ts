import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { HumanMessage } from '@langchain/core/messages';
import { getGradingGraph, getGraph } from './agent/agent';
import { GradingChat } from 'src/models/grading-chat.model';
import { ChatMessage } from 'src/models/chat-message.model';
import { AgentChatDTO, MessageType } from './dto/agentChat.dto';
import FormData from 'form-data';
import * as fs from 'fs';
import { Blob } from 'buffer';
@Injectable()
export class GradingAgentService {
  private app: any;

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

  async invokeSupervisor(
    agentDTO: AgentChatDTO,
    req: any,
    file?: Express.Multer.File,
  ) {
    try {
      const gradingChatTable = await GradingChat.findOne({
        where: { id: Number(agentDTO.gradingChatId) },
      });

      if (!gradingChatTable) {
        throw new Error('Grading chat data not found.');
      }

      let content = agentDTO.content;
      // 1️⃣ If voice message, call OpenAI Whisper
      let audioFileUrl: string | null = null;
      // if (agentDTO.messageType === MessageType.VOICE) {
      //   if (!file)
      //     throw new Error('Voice file is required for messageType VOICE');
      //   console.log('here');
      //   const formData = new FormData();
      //   const blob = new Blob([file.buffer], { type: 'audio/webm' }); // adjust MIME type if needed
      //   console.log('blob', blob);
      //   formData.append('file', blob, file.originalname);
      //   formData.append('model', 'whisper-1');
      //   console.log(formData);
      //   const whisperResp = await fetch(
      //     'https://api.openai.com/v1/audio/transcriptions',
      //     {
      //       method: 'POST',
      //       headers: {
      //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      //       },
      //       body: formData as any,
      //     },
      //   );

      //   const transcriptionData = await whisperResp.json();
      //   console.log('transcipriont text', transcriptionData);
      //   console.log('transcipriont text 2', transcriptionData.text);
      //   content = transcriptionData.text;

      //   // save the file URL or blob if needed in the return
      //   audioFileUrl = transcriptionData.url || null;
      // }

      // if (!content) {
      //   throw new HttpException('no content found', 404);
      // }

      // 2️⃣ Save user message
      await ChatMessage.create({
        gradingChatId: Number(agentDTO.gradingChatId),
        content,
        agent: false,
      } as any);

      // 3️⃣ Prepare input for supervisor
      const thread_id = `${req.user.sub}-${agentDTO.gradingChatId}`;
      const thredConfig = { configurable: { thread_id } };
      const input = {
        gradingChatId: Number(agentDTO.gradingChatId),
        patientProfileId: gradingChatTable.patientProfileId,
        user_id: req.user.id,
        user_message: new HumanMessage(content),
      };

      // 4️⃣ Invoke agent
      const response = await this.app.invoke(input, thredConfig);

      if (!response.final_response || response.final_response === '') {
        throw new Error(
          'No final response from supervisor. Final response is empty',
        );
      }

      // 5️⃣ If voice, generate TTS audio
      if (agentDTO.messageType === MessageType.VOICE) {
        try {
          const ttsResp = await fetch(
            'https://api.openai.com/v1/audio/speech',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini-tts',
                voice: 'alloy',
                input: response.final_response,
                format: 'mp3',
              }),
            },
          );

          const buffer = Buffer.from(await ttsResp.arrayBuffer());
          // Save locally or to S3
          const filename = `tts_${Date.now()}.mp3`;
          const filepath = `./public/audio/${filename}`;
          fs.writeFileSync(filepath, buffer);
          audioFileUrl = `/audio/${filename}`; // relative URL for frontend
        } catch (err) {
          console.error('TTS generation failed:', err);
        }
      }

      // 5️⃣ Save supervisor message
      await ChatMessage.create({
        gradingChatId: Number(agentDTO.gradingChatId),
        agent: true,
        content: response.final_response,
      } as any);

      // 6️⃣ Return structured response
      const result: any = {
        statusCode: 200,
        message: response.final_response,
      };

      if (agentDTO.messageType === MessageType.VOICE) {
        result.audioFile = audioFileUrl; // include Whisper audio reference
      }

      return result;
    } catch (error) {
      return { error: error.message || 'Failed to invoke supervisor.' };
    }
  }
}
