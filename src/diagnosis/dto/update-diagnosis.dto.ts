import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateDiagnosisDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  clusterId?: number | null;

  @IsString()
  @IsOptional()
  description?: string | null;
}

