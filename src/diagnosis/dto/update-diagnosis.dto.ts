import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { GradingMode } from '../../models/enums/grading-mode.enum';

export class UpdateDiagnosisDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsInt()
  @IsOptional()
  clusterId?: number | null;

  @IsEnum(GradingMode)
  @IsOptional()
  gradingMode?: GradingMode;

  @IsString()
  @IsOptional()
  description?: string | null;
}

