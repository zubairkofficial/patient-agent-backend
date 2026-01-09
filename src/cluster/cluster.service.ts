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

  async create(createClusterDto: CreateClusterDto): Promise<Cluster> {
    return await this.clusterModel.create(createClusterDto);
  }

  async findAll(): Promise<Cluster[]> {
    return await this.clusterModel.findAll();
  }

  async findOne(id: number): Promise<Cluster> {
    const cluster = await this.clusterModel.findByPk(id);
    if (!cluster) {
      throw new NotFoundException(`Cluster with ID ${id} not found`);
    }
    return cluster;
  }

  async update(id: number, updateClusterDto: UpdateClusterDto): Promise<Cluster> {
    const cluster = await this.findOne(id);
    await cluster.update(updateClusterDto);
    return cluster;
  }

  async remove(id: number): Promise<void> {
    const cluster = await this.findOne(id);
    await cluster.destroy();
  }
}

