import { IsInt } from 'class-validator';

export class CreateGradingChatDTO {
  @IsInt()
  patientProfileId: number;
}
