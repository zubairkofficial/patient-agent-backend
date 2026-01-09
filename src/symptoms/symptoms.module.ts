import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SymptomsService } from './symptoms.service';
import { SymptomsController } from './symptoms.controller';
import { Symptoms } from '../models/symptoms.model';
import { SeverityScale } from '../models/severity-scale.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [SequelizeModule.forFeature([Symptoms, SeverityScale])],
  controllers: [SymptomsController],
  providers: [SymptomsService, JwtAuthGuard, RolesGuard],
  exports: [SymptomsService],
})
export class SymptomsModule {}

