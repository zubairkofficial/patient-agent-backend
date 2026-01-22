import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateSeverityScaleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  details: Record<string, any>;

  @IsInt()
  symptomId: number;
}
