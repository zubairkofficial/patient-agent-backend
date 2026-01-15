import { IsString, IsOptional, IsInt, IsObject } from 'class-validator';

export class UpdateSeverityScaleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

