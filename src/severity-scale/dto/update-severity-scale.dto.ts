import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateSeverityScaleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  symptomId?: number;
}

