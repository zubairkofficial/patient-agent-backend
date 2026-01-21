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

  async create(createDiagnosisDto: CreateDiagnosisDto): Promise<any> {
    const diagnosis = await this.diagnosisModel.create(createDiagnosisDto as any);
    return {
      success: true,
      message: 'Diagnosis created successfully',
      data: diagnosis,
    };
  }

  async findAll(): Promise<any> {
    const diagnoses = await this.diagnosisModel.findAll({
      include: ['cluster'],
    });
    return {
      success: true,
      message: 'Diagnoses fetched successfully',
      data: diagnoses,
    };
  }

  async findOne(id: number): Promise<any> {
    const diagnosis = await this.diagnosisModel.findByPk(id, {
      include: ['cluster'],
    });
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Diagnosis fetched successfully',
      data: diagnosis,
    };
  }

  async update(id: number, updateDiagnosisDto: UpdateDiagnosisDto): Promise<any> {
    const diagnosis = await this.diagnosisModel.findByPk(id);
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with ID ${id} not found`);
    }
    // Filter out undefined values to only update provided fields
    const updateData = Object.fromEntries(
      Object.entries(updateDiagnosisDto).filter(([_, value]) => value !== undefined),
    );
    await diagnosis.update(updateData);
    return {
      success: true,
      message: 'Diagnosis updated successfully',
      data: diagnosis,
    };
  }

  async remove(id: number): Promise<any> {
    const diagnosis = await this.diagnosisModel.findByPk(id);
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with ID ${id} not found`);
    }
    await diagnosis.destroy();
    return {
      success: true,
      message: 'Diagnosis deleted successfully',
    };
  }
}

