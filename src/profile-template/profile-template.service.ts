import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProfileTemplate } from '../models/profile-template.model';
import { CreateProfileTemplateDto } from './dto/create-profile-template.dto';
import { UpdateProfileTemplateDto } from './dto/update-profile-template.dto';

@Injectable()
export class ProfileTemplateService {
  constructor(
    @InjectModel(ProfileTemplate)
    private profileTemplateModel: typeof ProfileTemplate,
  ) {}

  async create(createProfileTemplateDto: CreateProfileTemplateDto): Promise<any> {
    const profileTemplate = await this.profileTemplateModel.create(
      createProfileTemplateDto as any,
    );
    return {
      success: true,
      message: 'Profile template created successfully',
      data: profileTemplate,
    };
  }

  async findAll(): Promise<any> {
    const profileTemplates = await this.profileTemplateModel.findAll({
      include: ['diagnosis'],
    });
    return {
      success: true,
      message: 'Profile templates fetched successfully',
      data: profileTemplates,
    };
  }

  async findOne(id: number): Promise<any> {
    const profileTemplate = await this.profileTemplateModel.findByPk(id, {
      include: ['diagnosis'],
    });
    if (!profileTemplate) {
      throw new NotFoundException(`Profile template with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Profile template fetched successfully',
      data: profileTemplate,
    };
  }

  async update(
    id: number,
    updateProfileTemplateDto: UpdateProfileTemplateDto,
  ): Promise<any> {
    const profileTemplate = await this.profileTemplateModel.findByPk(id);
    if (!profileTemplate) {
      throw new NotFoundException(`Profile template with ID ${id} not found`);
    }
    // Filter out undefined values to only update provided fields
    const updateData = Object.fromEntries(
      Object.entries(updateProfileTemplateDto).filter(
        ([_, value]) => value !== undefined,
      ),
    );
    await profileTemplate.update(updateData);
    return {
      success: true,
      message: 'Profile template updated successfully',
      data: profileTemplate,
    };
  }

  async remove(id: number): Promise<any> {
    const profileTemplate = await this.profileTemplateModel.findByPk(id);
    if (!profileTemplate) {
      throw new NotFoundException(`Profile template with ID ${id} not found`);
    }
    await profileTemplate.destroy();
    return {
      success: true,
      message: 'Profile template deleted successfully',
    };
  }
}
