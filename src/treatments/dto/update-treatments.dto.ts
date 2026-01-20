import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateTreatmentsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  diagnosisId?: number;

  @IsInt()
  @IsOptional()
  clusterId?: number;
}

