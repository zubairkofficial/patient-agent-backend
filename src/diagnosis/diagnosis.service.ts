import {
  Injectable,
  NotFoundException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
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
    try {
      const diagnosis = await this.diagnosisModel.create(
        createDiagnosisDto as any,
      );
      return {
        success: true,
        message: 'Diagnosis created successfully',
        data: diagnosis,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to create diagnosis',
      );
    }
  }

  async findAll(): Promise<any> {
    try {
      const diagnoses = await this.diagnosisModel.findAll();
      return {
        success: true,
        message: 'Diagnoses fetched successfully',
        data: diagnoses,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch diagnoses',
      );
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const diagnosis = await this.diagnosisModel.findByPk(id);

      if (!diagnosis) {
        throw new NotFoundException(`Diagnosis with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Diagnosis fetched successfully',
        data: diagnosis,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // keep original status & message
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch diagnosis',
      );
    }
  }

  async update(
    id: number,
    updateDiagnosisDto: UpdateDiagnosisDto,
  ): Promise<any> {
    try {
      const diagnosis = await this.diagnosisModel.findByPk(id);

      if (!diagnosis) {
        throw new NotFoundException(`Diagnosis with ID ${id} not found`);
      }

      const updateData = Object.fromEntries(
        Object.entries(updateDiagnosisDto).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      await diagnosis.update(updateData);

      return {
        success: true,
        message: 'Diagnosis updated successfully',
        data: diagnosis,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to update diagnosis',
      );
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const diagnosis = await this.diagnosisModel.findByPk(id);

      if (!diagnosis) {
        throw new NotFoundException(`Diagnosis with ID ${id} not found`);
      }

      await diagnosis.destroy();

      return {
        success: true,
        message: 'Diagnosis deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete diagnosis',
      );
    }
  }
}
