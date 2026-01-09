import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSymptomsDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  description?: string | null;
}

