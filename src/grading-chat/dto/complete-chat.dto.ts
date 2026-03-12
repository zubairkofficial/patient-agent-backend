import { IsOptional, IsString } from 'class-validator';

export class CompleteChatDTO {
  @IsOptional()
  @IsString()
  clinicalNote?: string;
}
