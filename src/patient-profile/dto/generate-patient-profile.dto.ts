import { IsNumber, IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum ClinicalNoteRequirementOptions {
  TRUE = 'true',
  FALSE = 'false',
}

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

  @IsEnum(ClinicalNoteRequirementOptions)
  isClinicalNoteRequired: ClinicalNoteRequirementOptions;
}
