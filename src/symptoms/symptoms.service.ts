import {
  Injectable,
  NotFoundException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
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
    try {
      const symptom = await this.symptomsModel.create(createSymptomsDto as any);
      return {
        success: true,
        message: 'Symptom created successfully',
        data: symptom,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to create symptom',
      );
    }
  }

  async findAll(): Promise<any> {
    try {
      const symptoms = await this.symptomsModel.findAll();
      return {
        success: true,
        message: 'Symptoms fetched successfully',
        data: symptoms,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch symptoms',
      );
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const symptom = await this.symptomsModel.findByPk(id);

      if (!symptom) {
        throw new NotFoundException(`Symptom with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Symptom fetched successfully',
        data: symptom,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch symptom',
      );
    }
  }

  async update(id: number, updateSymptomsDto: UpdateSymptomsDto): Promise<any> {
    try {
      const symptom = await this.symptomsModel.findByPk(id);

      if (!symptom) {
        throw new NotFoundException(`Symptom with ID ${id} not found`);
      }

      const updateData = Object.fromEntries(
        Object.entries(updateSymptomsDto).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      await symptom.update(updateData);

      return {
        success: true,
        message: 'Symptom updated successfully',
        data: symptom,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to update symptom',
      );
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const symptom = await this.symptomsModel.findByPk(id);

      if (!symptom) {
        throw new NotFoundException(`Symptom with ID ${id} not found`);
      }

      await symptom.destroy();

      return {
        success: true,
        message: 'Symptom deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete symptom',
      );
    }
  }
}
