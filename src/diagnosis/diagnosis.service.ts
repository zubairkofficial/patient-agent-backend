import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Diagnosis } from '../models/diagnosis.model';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';

@Injectable()
export class DiagnosisService {
  constructor(
    @InjectModel(Diagnosis)
    private diagnosisModel: typeof Diagnosis,
  ) {}

  async create(createDiagnosisDto: CreateDiagnosisDto): Promise<Diagnosis> {
    return await this.diagnosisModel.create(createDiagnosisDto as any);
  }

  async findAll(): Promise<Diagnosis[]> {
    return await this.diagnosisModel.findAll({
      include: ['cluster'],
    });
  }

  async findOne(code: string): Promise<Diagnosis> {
    const diagnosis = await this.diagnosisModel.findByPk(code, {
      include: ['cluster'],
    });
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with code ${code} not found`);
    }
    return diagnosis;
  }

  async update(code: string, updateDiagnosisDto: UpdateDiagnosisDto): Promise<Diagnosis> {
    const diagnosis = await this.findOne(code);
    await diagnosis.update(updateDiagnosisDto);
    return diagnosis;
  }

  async remove(code: string): Promise<void> {
    const diagnosis = await this.findOne(code);
    await diagnosis.destroy();
  }
}

