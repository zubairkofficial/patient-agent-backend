import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiagnosisService } from './diagnosis.service';
import { DiagnosisController } from './diagnosis.controller';
import { Diagnosis } from '../models/diagnosis.model';
import { Cluster } from '../models/cluster.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [SequelizeModule.forFeature([Diagnosis, Cluster])],
  controllers: [DiagnosisController],
  providers: [DiagnosisService, JwtAuthGuard, RolesGuard],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}

