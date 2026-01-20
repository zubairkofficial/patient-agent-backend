import { IsString, IsOptional } from 'class-validator';

export class UpdateSymptomsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

