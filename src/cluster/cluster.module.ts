import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClusterService } from './cluster.service';
import { ClusterController } from './cluster.controller';
import { Cluster } from '../models/cluster.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [SequelizeModule.forFeature([Cluster])],
  controllers: [ClusterController],
  providers: [ClusterService, JwtAuthGuard, RolesGuard],
  exports: [ClusterService],
})
export class ClusterModule {}

