import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateSymptomsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z_]+$/, {
    message: 'Code must contain only letters (a-z, A-Z) and underscores (_). No numbers or special characters allowed.',
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsOptional()
  description?: string | null;
}

