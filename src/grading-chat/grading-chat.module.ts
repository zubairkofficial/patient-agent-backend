import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GradingChatController } from './grading-chat.controller';
import { GradingChatService } from './grading-chat.service';
import { GradingChat } from '../models/grading-chat.model';
import { ChatMessage } from '../models/chat-message.model';
import { GradingAgentService } from './grading-agent.service';
import { AuthModule } from 'src/auth/auth.module';
import { GradingChatGateway } from './grading-chat.gateway';

@Module({
  imports: [SequelizeModule.forFeature([GradingChat, ChatMessage]), AuthModule],
  controllers: [GradingChatController],
  providers: [GradingChatService, GradingAgentService, GradingChatGateway],
})
export class GradingChatModule {}
