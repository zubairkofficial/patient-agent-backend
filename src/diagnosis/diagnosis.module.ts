import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiagnosisService } from './diagnosis.service';
import { DiagnosisController } from './diagnosis.controller';
import { Diagnosis } from '../models/diagnosis.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Diagnosis]), AuthModule],
  controllers: [DiagnosisController],
  providers: [DiagnosisService, JwtAuthGuard, RolesGuard],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}
