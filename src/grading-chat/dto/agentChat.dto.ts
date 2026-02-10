import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AgentChatDTO {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsInt()
  gradingChatId: number;
}
