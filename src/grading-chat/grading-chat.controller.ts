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

@Controller('grading-chat')
export class GradingChatController {
  constructor(
    private readonly gradingChatService: GradingChatService,
    private readonly gradingAgentService: GradingAgentService,
  ) {}

  @Get('/chats/:patient_profile_id')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChats(
    @Param('patient_profile_id', ParseIntPipe) patientProfileId: number,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub || request['user'].id;
    return await this.gradingChatService.getChatsByPatientProfile(
      userId,
      patientProfileId,
    );
  }

  @Post('chat-agent')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async chatAgent(@Body() agentChatDTO: AgentChatDTO, @Req() req: any) {
    return this.gradingAgentService.invokeSupervisor(agentChatDTO, req);
  }
}