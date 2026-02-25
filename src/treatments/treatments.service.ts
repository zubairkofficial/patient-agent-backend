import {
  Injectable,
  NotFoundException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Treatments } from '../models/treatments.model';
import { CreateTreatmentsDto } from './dto/create-treatments.dto';
import { UpdateTreatmentsDto } from './dto/update-treatments.dto';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectModel(Treatments)
    private treatmentsModel: typeof Treatments,
  ) {}

  async create(createTreatmentsDto: CreateTreatmentsDto): Promise<any> {
    try {
      const treatment = await this.treatmentsModel.create(
        createTreatmentsDto as any,
      );
      return {
        success: true,
        message: 'Treatment created successfully',
        data: treatment,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to create treatment',
      );
    }
  }

  async findAll(): Promise<any> {
    try {
      const treatments = await this.treatmentsModel.findAll({
        include: ['diagnosis'],
      });
      return {
        success: true,
        message: 'Treatments fetched successfully',
        data: treatments,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch treatments',
      );
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const treatment = await this.treatmentsModel.findByPk(id, {
        include: ['diagnosis'],
      });

      if (!treatment) {
        throw new NotFoundException(`Treatment with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Treatment fetched successfully',
        data: treatment,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch treatment',
      );
    }
  }

  async update(
    id: number,
    updateTreatmentsDto: UpdateTreatmentsDto,
  ): Promise<any> {
    try {
      const treatment = await this.treatmentsModel.findByPk(id);

      if (!treatment) {
        throw new NotFoundException(`Treatment with ID ${id} not found`);
      }

      const updateData = Object.fromEntries(
        Object.entries(updateTreatmentsDto).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      await treatment.update(updateData);

      return {
        success: true,
        message: 'Treatment updated successfully',
        data: treatment,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to update treatment',
      );
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const treatment = await this.treatmentsModel.findByPk(id);

      if (!treatment) {
        throw new NotFoundException(`Treatment with ID ${id} not found`);
      }

      await treatment.destroy();

      return {
        success: true,
        message: 'Treatment deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete treatment',
      );
    }
  }
}
