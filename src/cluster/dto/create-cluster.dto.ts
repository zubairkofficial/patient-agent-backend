import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateClusterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

