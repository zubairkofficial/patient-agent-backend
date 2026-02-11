import { Injectable } from '@nestjs/common';
import { HumanMessage } from '@langchain/core/messages';
import { getGraph } from './agent/agent';
import { GradingChat } from 'src/models/grading-chat.model';
import { ChatMessage } from 'src/models/chat-message.model';
import { AgentChatDTO } from './dto/agentChat.dto';

@Injectable()
export class GradingAgentService {
  private app: any;

  constructor() {
    this.init();
  }

  private async init() {
    this.app = await getGraph();
  }

  async invokeSupervisor(agentDTO: AgentChatDTO, req: any) {
    try {
      const gradingChatTable = await GradingChat.findOne({
        where: {
          id: agentDTO.gradingChatId,
        },
      });

      if (!gradingChatTable) {
        throw new Error('Grading chat data not found.');
      }

      const thread_id = `${req.user.sub}-${agentDTO.gradingChatId}`;

      await ChatMessage.create({
        gradingChatId: agentDTO.gradingChatId,
        content: agentDTO.content,
        agent: false,
      } as any);

      let thredConfig = {
        configurable: { thread_id: thread_id },
      };

      let input = {
        gradingChatId: agentDTO.gradingChatId,
        patientProfileId: gradingChatTable.patientProfileId,
        user_id: req.user.id,
        user_message: new HumanMessage(agentDTO.content),
      };

      const response = await this.app.invoke(input, thredConfig);

      if (response.final_response !== '') {
        await ChatMessage.create({
          gradingChatId: agentDTO.gradingChatId,
          agent: true,
          content: response.final_response,
          score: response.last_score ?? null,
          // metadata: response.metadata ?? null,
        } as any);
      } else {
        throw new Error('No final response from supervisor. Final response is empty');
      }

      return {
        statusCode: 200,
        message: response.final_response,
      };
    } catch (error) {
      return { error: error.message || 'Failed to invoke supervisor.' };
    }
  }
}
