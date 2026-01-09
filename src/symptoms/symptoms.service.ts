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

  async create(createSymptomsDto: CreateSymptomsDto): Promise<Symptoms> {
    return await this.symptomsModel.create(createSymptomsDto as any);
  }

  async findAll(): Promise<Symptoms[]> {
    return await this.symptomsModel.findAll({
      include: ['severityScales'],
    });
  }

  async findOne(code: string): Promise<Symptoms> {
    const symptom = await this.symptomsModel.findByPk(code, {
      include: ['severityScales'],
    });
    if (!symptom) {
      throw new NotFoundException(`Symptom with code ${code} not found`);
    }
    return symptom;
  }

  async update(code: string, updateSymptomsDto: UpdateSymptomsDto): Promise<Symptoms> {
    const symptom = await this.findOne(code);
    await symptom.update(updateSymptomsDto);
    return symptom;
  }

  async remove(code: string): Promise<void> {
    const symptom = await this.findOne(code);
    await symptom.destroy();
  }
}

