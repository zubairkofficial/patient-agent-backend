import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { Treatments } from '../models/treatments.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Treatments]), AuthModule],
  controllers: [TreatmentsController],
  providers: [TreatmentsService, JwtAuthGuard, RolesGuard],
  exports: [TreatmentsService],
})
export class TreatmentsModule {}

