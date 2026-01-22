import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OperationsController],
  providers: [OperationsService, JwtAuthGuard, RolesGuard],
  exports: [OperationsService],
})
export class OperationsModule {}
