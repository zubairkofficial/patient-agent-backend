import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class GeneratePatientProfileDto {
  @IsNumber()
  @IsNotEmpty()
  diagnosis_id: number;

  @IsString()
  @IsNotEmpty()
  chief_complaint: string;
}
