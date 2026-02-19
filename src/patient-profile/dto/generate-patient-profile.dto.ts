import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class GeneratePatientProfileDto {
  @IsNumber()
  @IsNotEmpty()
  diagnosis_id: number;

  @IsNumber()
  @IsNotEmpty()
  course_id: number;

  @IsString()
  instruction: string;
}
