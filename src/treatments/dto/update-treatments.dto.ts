import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateTreatmentsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsInt()
  @IsOptional()
  diagnosisId?: number | null;

  @IsInt()
  @IsOptional()
  clusterId?: number | null;
}

