import { IsString, IsOptional } from 'class-validator';

export class UpdateClusterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

