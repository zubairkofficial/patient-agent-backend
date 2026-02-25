import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { GradingChatService } from './grading-chat.service';
// import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { AgentChatDTO } from './dto/agentChat.dto';
import { GradingAgentService } from './grading-agent.service';
import { CreateGradingChatDTO } from './dto/create-grading-chat.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('grading-chat')
export class GradingChatController {
  constructor(
    private readonly gradingChatService: GradingChatService,
    private readonly gradingAgentService: GradingAgentService,
  ) {}

  @Get('chat-result/:gradingChatId')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChatResultByGradingId(
    @Param('gradingChatId', ParseIntPipe) gradingChatId: number,
    @Req() req: any,
  ) {
    return await this.gradingChatService.getChatResultByGradingId(
      gradingChatId,
      req,
    );
  }

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

  @Get('results/:user_id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getGradingResultsByUser(
    @Param('user_id', ParseIntPipe) userId: number,
  ) {
    return await this.gradingChatService.getGradingResultsByUser(userId);
  }

  // @Patch('results/update')
  // @Roles([RolesEnum.ADMIN])
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async updateGradingResults(
  //   @Param('grading_chat_id', ParseIntPipe) gradingChatId: number,
  //   @Req() req: any,
  // ) {
  //   return this.gradingAgentService.updateGradingResults(gradingChatId, req);
  // }
  @Post('chat-agent')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file')) // for voice messages
  async chatAgent(
    @Body() agentChatDTO: AgentChatDTO,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.gradingAgentService.invokeSupervisor(agentChatDTO, req, file);
  }

  @Post('complete-chat/:grading_chat_id')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async completeChat(
    @Param('grading_chat_id', ParseIntPipe) gradingChatId: number,
    @Req() req: any,
  ) {
    return this.gradingAgentService.completeChat(gradingChatId, req);
  }
}
