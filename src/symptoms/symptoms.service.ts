import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Symptoms } from '../models/symptoms.model';
import { CreateSymptomsDto } from './dto/create-symptoms.dto';
import { UpdateSymptomsDto } from './dto/update-symptoms.dto';

@Injectable()
export class SymptomsService {
  constructor(
    @InjectModel(Symptoms)
    private symptomsModel: typeof Symptoms,
  ) {}

  async create(createSymptomsDto: CreateSymptomsDto): Promise<any> {
    const symptom = await this.symptomsModel.create(createSymptomsDto as any);
    return {
      success: true,
      message: 'Symptom created successfully',
      data: symptom,
    };
  }

  async findAll(): Promise<any> {
    const symptoms = await this.symptomsModel.findAll({
      include: ['severityScales'],
    });
    return {
      success: true,
      message: 'Symptoms fetched successfully',
      data: symptoms,
    };
  }

  async findOne(id: number): Promise<any> {
    const symptom = await this.symptomsModel.findByPk(id, {
      include: ['severityScales'],
    });
    if (!symptom) {
      throw new NotFoundException(`Symptom with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Symptom fetched successfully',
      data: symptom,
    };
  }

  async update(id: number, updateSymptomsDto: UpdateSymptomsDto): Promise<any> {
    const symptom = await this.symptomsModel.findByPk(id);
    if (!symptom) {
      throw new NotFoundException(`Symptom with ID ${id} not found`);
    }
    await symptom.update(updateSymptomsDto);
    return {
      success: true,
      message: 'Symptom updated successfully',
      data: symptom,
    };
  }

  async remove(id: number): Promise<any> {
    const symptom = await this.symptomsModel.findByPk(id);
    if (!symptom) {
      throw new NotFoundException(`Symptom with ID ${id} not found`);
    }
    await symptom.destroy();
    return {
      success: true,
      message: 'Symptom deleted successfully',
    };
  }
}

