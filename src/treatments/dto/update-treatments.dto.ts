import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TreatmentType } from '../../models/enums/treatment-type.enum';

export class UpdateTreatmentsDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsEnum(TreatmentType)
  @IsOptional()
  type?: TreatmentType;

  @IsString()
  @IsOptional()
  description?: string | null;
}

