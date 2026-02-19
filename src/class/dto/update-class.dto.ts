import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
