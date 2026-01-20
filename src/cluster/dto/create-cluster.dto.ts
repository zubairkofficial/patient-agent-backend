import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClusterDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

