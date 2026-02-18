import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PatientProfile } from '../models/patient-profile.model';
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

  // findAllByCourse
  async findAllByCourse(courseId: number): Promise<any> {
    try {
      const patientProfiles = await this.patientProfileModel.findAll({
        where: { courseId },
        attributes: ['id', 'primary_diagnosis', 'case_metadata', 'saved'],
      });

      return {
        success: true,
        message: 'Patient profiles fetched successfully',
        data: patientProfiles,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch patient profiles by course',
      );
    }
  }

  async findAll(req: any): Promise<any> {
    try {
      let patientProfiles: any[] = [];

      if (req.user.role === Roles.USER) {
        patientProfiles = await this.patientProfileModel.findAll({
          attributes: ['id', 'primary_diagnosis', 'case_metadata', 'saved'],
          where: { saved: true },
          include: [
            {
              model: GradingChat,
              where: { userId: req.user.id },
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
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch patient profiles',
      );
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const patientProfile = await this.patientProfileModel.findByPk(id);

      if (!patientProfile) {
        throw new NotFoundException(`Patient profile with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Patient profile fetched successfully',
        data: patientProfile,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch patient profile');
    }
  }

  async generateProfile(
    diagnosisId: number,
    courseId: number,
    instruction: string,
  ): Promise<{ profile: GeneratedPatientProfile; id: number }> {
    try {
      return await this.aiService.generatePatientProfile(
        diagnosisId,
        courseId,
        instruction,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate patient profile',
      );
    }
  }

  async saveProfile(id: number, save: boolean): Promise<any> {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update saved status');
    }
  }

  async remove(id: number): Promise<any> {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to delete patient profile',
      );
    }
  }

  async regenerateProfile(
    profile_id: number,
    instruction?: string,
  ): Promise<{ profile: GeneratedPatientProfile; id: number }> {
    try {
      return await this.aiService.regeneratePatientProfile(
        profile_id,
        instruction,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to regenerate patient profile',
      );
    }
  }
}
