import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PatientProfile } from '../models/patient-profile.model';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { PatientProfileAiService } from './patient-profile-ai.service';
import { GeneratedPatientProfile } from './schemas/patient-profile.schema';
import { Roles } from 'src/auth/roles.enum';
import { GradingChat } from 'src/models/grading-chat.model';

@Injectable()
export class PatientProfileService {
  constructor(
    @InjectModel(PatientProfile)
    private patientProfileModel: typeof PatientProfile,
    private readonly aiService: PatientProfileAiService,
  ) {}

  async findAll(req: any): Promise<any> {
    let patientProfiles: any[] = [];

    if (req.user.role === Roles.USER) {
      patientProfiles = await this.patientProfileModel.findAll({
        attributes: ['id', 'primary_diagnosis', 'case_metadata', 'saved'],
        where: {
          saved: true,
        },
        include: [
          {
            model: GradingChat,
            where: {
              userId: req.user.id,
            },
            required: false,
          },
        ],
      });
    } else if (req.user.role === Roles.ADMIN) {
      patientProfiles = await this.patientProfileModel.findAll({
        attributes: [
          'id',
          'primary_diagnosis',
          'createdAt',
          'updatedAt',
          'saved',
        ],
      });
    }

    return {
      success: true,
      message: 'Patient profiles fetched successfully',
      data: patientProfiles,
    };
  }

  async findOne(id: number): Promise<any> {
    const patientProfile = await this.patientProfileModel.findByPk(id);
    if (!patientProfile) {
      throw new NotFoundException(`Patient profile with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Patient profile fetched successfully',
      data: patientProfile,
    };
  }

  async generateProfile(
    diagnosisId: number,
  ): Promise<{ profile: GeneratedPatientProfile; id: number }> {
    return await this.aiService.generatePatientProfile(diagnosisId);
  }

  async saveProfile(id: number, save: boolean): Promise<any> {
    const patientProfile = await this.patientProfileModel.findByPk(id, {
      attributes: ['id', 'saved'],
    });
    if (!patientProfile) {
      throw new NotFoundException(`Patient profile with ID ${id} not found`);
    }

    await patientProfile.update({ saved: save });

    return {
      success: true,
      message: `Patient profile ${save ? 'saved' : 'unsaved'} successfully`,
      saved: patientProfile.saved,
    };
  }

  async remove(id: number): Promise<any> {
    const patientProfile = await this.patientProfileModel.findByPk(id);
    if (!patientProfile) {
      throw new NotFoundException(`Patient profile with ID ${id} not found`);
    }
    await patientProfile.destroy();
    return {
      success: true,
      message: 'Patient profile deleted successfully',
      data: patientProfile,
    };
  }

  async regenerateProfile(
    profile_id: number,
    instruction?: string,
  ): Promise<{ profile: GeneratedPatientProfile; id: number }> {
    return await this.aiService.regeneratePatientProfile(
      profile_id,
      instruction,
    );
  }
}
