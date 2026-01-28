import { IsNumber, IsNotEmpty } from 'class-validator';

export class GeneratePatientProfileDto {
  @IsNumber()
  @IsNotEmpty()
  diagnosis_id: number;
}
