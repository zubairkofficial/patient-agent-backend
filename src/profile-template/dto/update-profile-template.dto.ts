import {
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class SymptomRequiredItemDto {
  @IsInt()
  @IsOptional()
  symptom_id?: number;

  @IsInt()
  @IsOptional()
  symptom_code?: number;

  @IsInt()
  @IsOptional()
  severity_scale_id?: number;
}

class SymptomPresentTypicalItemDto {
  @IsInt()
  @IsOptional()
  symptom_id?: number;

  @IsInt()
  @IsOptional()
  symptom_code?: number;

  @IsInt()
  @IsOptional()
  severity_scale_id?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  p_present?: number;
}

class SymptomOptionalItemDto {
  @IsInt()
  @IsOptional()
  symptom_id?: number;

  @IsInt()
  @IsOptional()
  symptom_code?: number;

  @IsInt()
  @IsOptional()
  severity_scale_id?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  p_present?: number;
}

class SymptomAbsentTypicalItemDto {
  @IsInt()
  @IsOptional()
  symptom_id?: number;

  @IsInt()
  @IsOptional()
  symptom_code?: number;
}

export class UpdateProfileTemplateDto {
  @IsInt()
  @IsOptional()
  seed?: number;

  @IsInt()
  @IsOptional()
  diagnosis_id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymptomRequiredItemDto)
  @IsOptional()
  symptoms_required?: SymptomRequiredItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymptomPresentTypicalItemDto)
  @IsOptional()
  symptoms_present_typical?: SymptomPresentTypicalItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymptomOptionalItemDto)
  @IsOptional()
  symptoms_optional?: SymptomOptionalItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymptomAbsentTypicalItemDto)
  @IsOptional()
  symptoms_absent_typical?: SymptomAbsentTypicalItemDto[];
}
