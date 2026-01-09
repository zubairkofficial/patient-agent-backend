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

  async create(createTreatmentsDto: CreateTreatmentsDto): Promise<Treatments> {
    return await this.treatmentsModel.create(createTreatmentsDto as any);
  }

  async findAll(): Promise<Treatments[]> {
    return await this.treatmentsModel.findAll();
  }

  async findOne(code: string): Promise<Treatments> {
    const treatment = await this.treatmentsModel.findByPk(code);
    if (!treatment) {
      throw new NotFoundException(`Treatment with code ${code} not found`);
    }
    return treatment;
  }

  async update(code: string, updateTreatmentsDto: UpdateTreatmentsDto): Promise<Treatments> {
    const treatment = await this.findOne(code);
    await treatment.update(updateTreatmentsDto);
    return treatment;
  }

  async remove(code: string): Promise<void> {
    const treatment = await this.findOne(code);
    await treatment.destroy();
  }
}

