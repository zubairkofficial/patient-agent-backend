import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSeverityScaleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symptomCode: string;
}

