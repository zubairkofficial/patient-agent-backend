import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDiagnosisDto {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().replace(/\s+/g, '_').toUpperCase();
    }
    return value;
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z_]+$/, {
    message:
      'Code must contain only letters (a-z, A-Z) and underscores (_). No numbers or special characters allowed.',
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
