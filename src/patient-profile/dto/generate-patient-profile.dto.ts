import { IsNumber, IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class GeneratePatientProfileDto {
  @IsNumber()
  @IsNotEmpty()
  diagnosis_id: number;

  @IsNumber()
  @IsNotEmpty()
  course_id: number;

  @IsString()
  instruction: string;

  @IsString()
  @IsNotEmpty()
  profile_name: string;

  @IsBoolean()
  isClinicalNoteRequired: boolean;
}
