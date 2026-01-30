import { IsString, IsOptional } from 'class-validator';

export class RegeneratePatientProfileDto {
  @IsString()
  @IsOptional()
  instruction?: string;
}
