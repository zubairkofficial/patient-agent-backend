import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateSeverityScaleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  symptomId: number;
}

