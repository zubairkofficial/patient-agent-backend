import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClusterService } from './cluster.service';
import { ClusterController } from './cluster.controller';
import { Cluster } from '../models/cluster.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Cluster]), AuthModule],
  controllers: [ClusterController],
  providers: [ClusterService, JwtAuthGuard, RolesGuard],
  exports: [ClusterService],
})
export class ClusterModule {}

