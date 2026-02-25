import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';

// Define enum for message types
export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
}

export class AgentChatDTO {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsInt()
  gradingChatId: string;

  @IsNotEmpty()
  @IsEnum(MessageType, {
    message: 'messageType must be either "text" or "voice"',
  })
  messageType: MessageType;
}
