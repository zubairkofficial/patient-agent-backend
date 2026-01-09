import { IsString, IsOptional } from 'class-validator';

export class UpdateSeverityScaleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  symptomCode?: string;
}

