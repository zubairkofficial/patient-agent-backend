import {
  IsInt,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class SymptomRequiredItemDto {
  @IsInt()
  @IsNotEmpty()
  symptom_id: number;

  @IsInt()
  @IsNotEmpty()
  symptom_code: number;

  @IsInt()
  @IsNotEmpty()
  severity_scale_id: number;
}

class SymptomPresentTypicalItemDto {
  @IsInt()
  @IsNotEmpty()
  symptom_id: number;

  @IsInt()
  @IsNotEmpty()
  symptom_code: number;

  @IsInt()
  @IsNotEmpty()
  severity_scale_id: number;

  @IsNumber()
  @Min(0)
  p_present: number;
}

class SymptomOptionalItemDto {
  @IsInt()
  @IsNotEmpty()
  symptom_id: number;

  @IsInt()
  @IsNotEmpty()
  symptom_code: number;

  @IsInt()
  @IsNotEmpty()
  severity_scale_id: number;

  @IsNumber()
  @Min(0)
  p_present: number;
}

class SymptomAbsentTypicalItemDto {
  @IsInt()
  @IsNotEmpty()
  symptom_id: number;

  @IsInt()
  @IsNotEmpty()
  symptom_code: number;
}

export class CreateProfileTemplateDto {
  @IsInt()
  @IsNotEmpty()
  seed: number;

  @IsInt()
  @IsNotEmpty()
  diagnosis_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymptomRequiredItemDto)
  @IsNotEmpty()
  symptoms_required: SymptomRequiredItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymptomPresentTypicalItemDto)
  @IsNotEmpty()
  symptoms_present_typical: SymptomPresentTypicalItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymptomOptionalItemDto)
  @IsNotEmpty()
  symptoms_optional: SymptomOptionalItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymptomAbsentTypicalItemDto)
  @IsNotEmpty()
  symptoms_absent_typical: SymptomAbsentTypicalItemDto[];
}
