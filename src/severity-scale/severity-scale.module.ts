import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeverityScaleService } from './severity-scale.service';
import { SeverityScaleController } from './severity-scale.controller';
import { SeverityScale } from '../models/severity-scale.model';
import { Symptoms } from '../models/symptoms.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([SeverityScale, Symptoms]), AuthModule],
  controllers: [SeverityScaleController],
  providers: [SeverityScaleService, JwtAuthGuard, RolesGuard],
  exports: [SeverityScaleService],
})
export class SeverityScaleModule {}

