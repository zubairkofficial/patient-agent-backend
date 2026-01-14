import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cluster } from '../models/cluster.model';
import { CreateClusterDto } from './dto/create-cluster.dto';
import { UpdateClusterDto } from './dto/update-cluster.dto';

@Injectable()
export class ClusterService {
  constructor(
    @InjectModel(Cluster)
    private clusterModel: typeof Cluster,
  ) {}

  async create(createClusterDto: CreateClusterDto): Promise<any> {
    const cluster = await this.clusterModel.create(createClusterDto as any);
    return {
      success: true,
      message: 'Cluster created successfully',
      data: cluster,
    };
  }

  async findAll(): Promise<any> {
    const clusters = await this.clusterModel.findAll();
    return {
      success: true,
      message: 'Clusters fetched successfully',
      data: clusters,
    };
  }

  async findOne(id: number): Promise<any> {
    const cluster = await this.clusterModel.findByPk(id);
    if (!cluster) {
      throw new NotFoundException(`Cluster with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Cluster fetched successfully',
      data: cluster,
    };
  }

  async update(id: number, updateClusterDto: UpdateClusterDto): Promise<any> {
    const cluster = await this.clusterModel.findByPk(id);
    if (!cluster) {
      throw new NotFoundException(`Cluster with ID ${id} not found`);
    }
    await cluster.update(updateClusterDto);
    return {
      success: true,
      message: 'Cluster updated successfully',
      data: cluster,
    };
  }

  async remove(id: number): Promise<any> {
    const cluster = await this.clusterModel.findByPk(id);
    if (!cluster) {
      throw new NotFoundException(`Cluster with ID ${id} not found`);
    }
    await cluster.destroy();
    return {
      success: true,
      message: 'Cluster deleted successfully',
    };
  }
}

