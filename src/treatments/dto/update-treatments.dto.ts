import { IsString, IsOptional, IsInt, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTreatmentsDto {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toUpperCase().replace(/\s+/g, '_');
    }
    return value;
  })
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
  description?: string;

  @IsInt()
  @IsOptional()
  diagnosisId?: number;

  @IsInt()
  @IsOptional()
  clusterId?: number;
}

