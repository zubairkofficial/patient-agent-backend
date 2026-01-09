import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt } from 'class-validator';
import { GradingMode } from '../../models/enums/grading-mode.enum';

export class CreateDiagnosisDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsInt()
  @IsOptional()
  clusterId?: number | null;

  @IsEnum(GradingMode)
  @IsNotEmpty()
  gradingMode: GradingMode;

  @IsString()
  @IsOptional()
  description?: string | null;
}

