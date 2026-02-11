import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GradingChat } from '../models/grading-chat.model';
import { ChatMessage } from '../models/chat-message.model';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Injectable()
export class GradingChatService {
  constructor(
    @InjectModel(GradingChat)
    private readonly gradingChatModel: typeof GradingChat,
    @InjectModel(ChatMessage)
    private readonly chatMessageModel: typeof ChatMessage,
  ) {}

  /**
   * Get all chat messages for a user and patient profile
   */
  async getChatsByPatientProfile(
    userId: number,
    patientProfileId: number,
  ): Promise<{ gradingChat: GradingChat; messages: ChatMessage[] }> {
    try {
      let gradingChat = await this.gradingChatModel.findOne({
        where: { userId, patientProfileId },
      });

      // Create grading chat if it doesn't exist
      if (!gradingChat) {
        gradingChat = await this.gradingChatModel.create({
          userId: userId,
          patientProfileId: patientProfileId,
        } as any);
      }

      const messages = await this.chatMessageModel.findAll({
        where: { gradingChatId: gradingChat.id },
        order: [['createdAt', 'ASC']],
      });

      return {
        gradingChat,
        messages,
      };
    } catch (error) {
      console.log('Error in getChatsByPatientProfile:', error);
      throw new BadRequestException(
        'Failed to retrieve or create grading chat',
      );
    }
  }
}
