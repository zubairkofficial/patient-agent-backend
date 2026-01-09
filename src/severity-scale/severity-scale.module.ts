import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeverityScaleService } from './severity-scale.service';
import { SeverityScaleController } from './severity-scale.controller';
import { SeverityScale } from '../models/severity-scale.model';
import { Symptoms } from '../models/symptoms.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [SequelizeModule.forFeature([SeverityScale, Symptoms])],
  controllers: [SeverityScaleController],
  providers: [SeverityScaleService, JwtAuthGuard, RolesGuard],
  exports: [SeverityScaleService],
})
export class SeverityScaleModule {}

