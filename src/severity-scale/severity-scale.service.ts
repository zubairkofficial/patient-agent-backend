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

  async create(createSeverityScaleDto: CreateSeverityScaleDto): Promise<SeverityScale> {
    return await this.severityScaleModel.create(createSeverityScaleDto as any);
  }

  async findAll(): Promise<SeverityScale[]> {
    return await this.severityScaleModel.findAll({
      include: ['symptom'],
    });
  }

  async findOne(id: number): Promise<SeverityScale> {
    const severityScale = await this.severityScaleModel.findByPk(id, {
      include: ['symptom'],
    });
    if (!severityScale) {
      throw new NotFoundException(`SeverityScale with ID ${id} not found`);
    }
    return severityScale;
  }

  async update(id: number, updateSeverityScaleDto: UpdateSeverityScaleDto): Promise<SeverityScale> {
    const severityScale = await this.findOne(id);
    await severityScale.update(updateSeverityScaleDto);
    return severityScale;
  }

  async remove(id: number): Promise<void> {
    const severityScale = await this.findOne(id);
    await severityScale.destroy();
  }
}

