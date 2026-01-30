import { IsBoolean, IsNotEmpty } from 'class-validator';

export class SavePatientProfileDto {
  @IsBoolean()
  @IsNotEmpty()
  save: boolean;
}
