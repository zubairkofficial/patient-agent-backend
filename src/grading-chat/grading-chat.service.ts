import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GradingChat } from '../models/grading-chat.model';
import { ChatMessage } from '../models/chat-message.model';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateGradingChatDTO } from './dto/create-grading-chat.dto';

@Injectable()
export class GradingChatService {
  constructor(
    @InjectModel(GradingChat)
    private readonly gradingChatModel: typeof GradingChat,
    @InjectModel(ChatMessage)
    private readonly chatMessageModel: typeof ChatMessage,
  ) {}

  async createGradingChat(
    createGradingChatDto: CreateGradingChatDTO,
    req: any,
  ) {
    try {
      let gradingChat = await this.gradingChatModel.findOne({
        where: {
          userId: req.user.id,
          patientProfileId: createGradingChatDto.patientProfileId,
        },
      });
      if (!gradingChat) {
        gradingChat = await this.gradingChatModel.create({
          userId: req.user.id,
          patientProfileId: createGradingChatDto.patientProfileId,
        } as any);
      }

      return {
        message: 'Grading chat created successfully',
        gradingChat,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create grading chat ' + error.message,
        500,
      );
    }
  }

  /**
   * Get all chat messages for a user and patient profile
   */
  async getChatsByPatientProfile(
    gradingChatId: number,
  ): Promise<{ messages: ChatMessage[] }> {
    try {
      const gradingChat = await this.gradingChatModel.findByPk(gradingChatId);

      if (!gradingChat) {
        throw new NotFoundException('Grading chat not found');
      }

      const messages = await this.chatMessageModel.findAll({
        where: { gradingChatId: gradingChat.id },
        order: [['createdAt', 'ASC']],
      });

      return {
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
