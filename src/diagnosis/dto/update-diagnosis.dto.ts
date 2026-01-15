import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateDiagnosisDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;
}

