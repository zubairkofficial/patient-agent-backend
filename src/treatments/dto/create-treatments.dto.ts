import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { TreatmentType } from '../../models/enums/treatment-type.enum';

export class CreateTreatmentsDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsEnum(TreatmentType)
  @IsNotEmpty()
  type: TreatmentType;

  @IsString()
  @IsOptional()
  description?: string | null;
}

