import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { GradingChatService } from './grading-chat.service';
// import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { AgentChatDTO } from './dto/agentChat.dto';
import { GradingAgentService } from './grading-agent.service';
import { CreateGradingChatDTO } from './dto/create-grading-chat.dto';

@Controller('grading-chat')
export class GradingChatController {
  constructor(
    private readonly gradingChatService: GradingChatService,
    private readonly gradingAgentService: GradingAgentService,
  ) {}

  @Post('/')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createGradingChat(
    @Body() createGradingChat: CreateGradingChatDTO,
    @Req() req: any,
  ) {
    return this.gradingChatService.createGradingChat(createGradingChat, req);
  }

  @Get('/chats/:grading_chat_id')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChats(
    @Param('grading_chat_id', ParseIntPipe) gradingChatId: number,
  ) {
    return await this.gradingChatService.getChatsByPatientProfile(
      gradingChatId,
    );
  }

  @Post('chat-agent')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async chatAgent(@Body() agentChatDTO: AgentChatDTO, @Req() req: any) {
    return this.gradingAgentService.invokeSupervisor(agentChatDTO, req);
  }
}
