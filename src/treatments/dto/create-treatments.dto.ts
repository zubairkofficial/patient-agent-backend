import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateTreatmentsDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

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

