import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ApiController],
})
export class ApiModule {}
