import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GradingAgentService } from './grading-agent.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GradingChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gradingService: GradingAgentService) {}

  async handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);
  }

  async handleDisconnect(socket: Socket) {
    console.log('Client disconnected:', socket.id);
  }

  @SubscribeMessage('chat-agent')
  async handleChat(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    await this.gradingService.streamAgentWithTTS(data, socket);
  }
}
