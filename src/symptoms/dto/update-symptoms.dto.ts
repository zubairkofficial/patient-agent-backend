import { IsString, IsOptional } from 'class-validator';

export class UpdateSymptomsDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  description?: string | null;
}

