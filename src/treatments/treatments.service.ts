import { Injectable, NotFoundException } from '@nestjs/common';
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
    const treatment = await this.treatmentsModel.create(createTreatmentsDto as any);
    return {
      success: true,
      message: 'Treatment created successfully',
      data: treatment,
    };
  }

  async findAll(): Promise<any> {
    const treatments = await this.treatmentsModel.findAll({
      include: ['diagnosis', 'cluster'],
    });
    return {
      success: true,
      message: 'Treatments fetched successfully',
      data: treatments,
    };
  }

  async findOne(id: number): Promise<any> {
    const treatment = await this.treatmentsModel.findByPk(id, {
      include: ['diagnosis', 'cluster'],
    });
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Treatment fetched successfully',
      data: treatment,
    };
  }

  async update(id: number, updateTreatmentsDto: UpdateTreatmentsDto): Promise<any> {
    const treatment = await this.treatmentsModel.findByPk(id);
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
    await treatment.update(updateTreatmentsDto);
    return {
      success: true,
      message: 'Treatment updated successfully',
      data: treatment,
    };
  }

  async remove(id: number): Promise<any> {
    const treatment = await this.treatmentsModel.findByPk(id);
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
    await treatment.destroy();
    return {
      success: true,
      message: 'Treatment deleted successfully',
    };
  }
}

