import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateDiagnosisDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsOptional()
  clusterId?: number | null;

  @IsString()
  @IsOptional()
  description?: string | null;
}

