import {
  Injectable,
  NotFoundException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
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
    try {
      const cluster = await this.clusterModel.create(createClusterDto as any);
      return {
        success: true,
        message: 'Cluster created successfully',
        data: cluster,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to create cluster',
      );
    }
  }

  async findAll(): Promise<any> {
    try {
      const clusters = await this.clusterModel.findAll();
      return {
        success: true,
        message: 'Clusters fetched successfully',
        data: clusters,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch clusters',
      );
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const cluster = await this.clusterModel.findByPk(id);

      if (!cluster) {
        throw new NotFoundException(`Cluster with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Cluster fetched successfully',
        data: cluster,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch cluster',
      );
    }
  }

  async update(id: number, updateClusterDto: UpdateClusterDto): Promise<any> {
    try {
      const cluster = await this.clusterModel.findByPk(id);

      if (!cluster) {
        throw new NotFoundException(`Cluster with ID ${id} not found`);
      }

      const updateData = Object.fromEntries(
        Object.entries(updateClusterDto).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      await cluster.update(updateData);

      return {
        success: true,
        message: 'Cluster updated successfully',
        data: cluster,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to update cluster',
      );
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const cluster = await this.clusterModel.findByPk(id);

      if (!cluster) {
        throw new NotFoundException(`Cluster with ID ${id} not found`);
      }

      await cluster.destroy();

      return {
        success: true,
        message: 'Cluster deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete cluster',
      );
    }
  }
}
