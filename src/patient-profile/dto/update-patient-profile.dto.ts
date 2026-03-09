import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdatePatientProfileDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  chief_complaint: string;
}
