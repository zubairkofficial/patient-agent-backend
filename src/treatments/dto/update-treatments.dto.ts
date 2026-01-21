import { IsString, IsOptional, IsInt, Matches } from 'class-validator';

export class UpdateTreatmentsDto {
  @IsString()
  @IsOptional()
  @Matches(/^[A-Za-z_]+$/, {
    message: 'Code must contain only letters (a-z, A-Z) and underscores (_). No numbers or special characters allowed.',
  })
  code?: string;

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

