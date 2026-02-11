import { IsString } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  content: string;
}
