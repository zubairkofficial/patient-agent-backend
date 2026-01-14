import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SeverityScale } from '../models/severity-scale.model';
import { CreateSeverityScaleDto } from './dto/create-severity-scale.dto';
import { UpdateSeverityScaleDto } from './dto/update-severity-scale.dto';

@Injectable()
export class SeverityScaleService {
  constructor(
    @InjectModel(SeverityScale)
    private severityScaleModel: typeof SeverityScale,
  ) {}

  async create(createSeverityScaleDto: CreateSeverityScaleDto): Promise<any> {
    const severityScale = await this.severityScaleModel.create(createSeverityScaleDto as any);
    return {
      success: true,
      message: 'Severity scale created successfully',
      data: severityScale,
    };
  }

  async findAll(): Promise<any> {
    const severityScales = await this.severityScaleModel.findAll({
      include: ['symptom'],
    });
    return {
      success: true,
      message: 'Severity scales fetched successfully',
      data: severityScales,
    };
  }

  async findOne(id: number): Promise<any> {
    const severityScale = await this.severityScaleModel.findByPk(id, {
      include: ['symptom'],
    });
    if (!severityScale) {
      throw new NotFoundException(`SeverityScale with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Severity scale fetched successfully',
      data: severityScale,
    };
  }

  async update(id: number, updateSeverityScaleDto: UpdateSeverityScaleDto): Promise<any> {
    const severityScale = await this.severityScaleModel.findByPk(id);
    if (!severityScale) {
      throw new NotFoundException(`SeverityScale with ID ${id} not found`);
    }
    await severityScale.update(updateSeverityScaleDto);
    return {
      success: true,
      message: 'Severity scale updated successfully',
      data: severityScale,
    };
  }

  async remove(id: number): Promise<any> {
    const severityScale = await this.severityScaleModel.findByPk(id);
    if (!severityScale) {
      throw new NotFoundException(`SeverityScale with ID ${id} not found`);
    }
    await severityScale.destroy();
    return {
      success: true,
      message: 'Severity scale deleted successfully',
    };
  }
}

