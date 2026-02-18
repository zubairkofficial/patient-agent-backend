import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class GeneratePatientProfileDto {
  @IsNumber()
  @IsNotEmpty()
  diagnosis_id: number;

  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @IsString()
  instruction: string;
}
