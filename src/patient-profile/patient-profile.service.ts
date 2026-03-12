import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PatientProfile } from '../models/patient-profile.model';
import { PatientProfileAiService } from './patient-profile-ai.service';
import { GeneratedPatientProfile } from './schemas/patient-profile.schema';
import { Roles } from 'src/auth/roles.enum';
import { GradingChat } from 'src/models/grading-chat.model';
import { Course } from 'src/models/course.model';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';

@Injectable()
export class PatientProfileService {
  constructor(
    @InjectModel(PatientProfile)
    private patientProfileModel: typeof PatientProfile,
    private readonly aiService: PatientProfileAiService,
  ) {}

  // findAllByCourse
  async findAllByCourse(courseId: number, req: any): Promise<any> {
    try {
      const patientProfiles = await this.patientProfileModel.findAll({
        where: { courseId, saved: true },
        attributes: [
          'id',
          'case_metadata',
          'saved',
          'profile_name',
          'isClinicalNoteRequired',
        ],
        include: [
          {
            model: GradingChat,
            attributes: [
              'id',
              'userId',
              'patientProfileId',
              'totalScore',
              'isCompleted',
              'createdAt',
              'updatedAt',
            ],
            where: { userId: req.user.id },
            required: false,
          },
        ],
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
      const patientProfiles = await this.patientProfileModel.findAll({
        attributes: [
          'id',
          'profile_name',
          'primary_diagnosis',
          'createdAt',
          'updatedAt',
          'saved',
          'isClinicalNoteRequired',
        ],
        include: [
          {
            model: Course,
          },
        ],
      });

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

  async updatePatientProfile(updatePatientProfile: UpdatePatientProfileDto) {
    try {
      const profile = await this.patientProfileModel.findByPk(
        updatePatientProfile.id,
        {
          attributes: ['id', 'case_metadata'],
        },
      );

      if (!profile) {
        throw new NotFoundException('Patient profile with ID does not exist');
      }

      profile.case_metadata = {
        ...profile.case_metadata,
        chief_complaint: updatePatientProfile.chief_complaint,
      };

      await profile.save();

      return {
        success: true,
        message: 'Patient profile updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'failed to update patient profile',
        error.code || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: number, req: any): Promise<any> {
    try {
      let patientProfile;

      if (req.user.role === Roles.USER) {
        patientProfile = await this.patientProfileModel.findOne({
          where: { id, saved: true },
          attributes: [
            'id',
            'case_metadata',
            'profile_name',
            'isClinicalNoteRequired',
          ],
        });
      } else if (req.user.role === Roles.ADMIN) {
        patientProfile = await this.patientProfileModel.findByPk(id);
      }

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
    name: string,
    isClinicalNoteRequired: boolean,
  ): Promise<{ profile: GeneratedPatientProfile; id: number }> {
    try {
      return await this.aiService.generatePatientProfile(
        diagnosisId,
        courseId,
        instruction,
        name,
        isClinicalNoteRequired,
      );
    } catch (error) {
      console.log('error', error);
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
