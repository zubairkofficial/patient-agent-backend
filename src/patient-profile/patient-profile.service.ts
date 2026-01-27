import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PatientProfile } from '../models/patient-profile.model';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { PatientProfileAiService } from './patient-profile-ai.service';
import { GeneratedPatientProfile } from './schemas/patient-profile.schema';

@Injectable()
export class PatientProfileService {
  constructor(
    @InjectModel(PatientProfile)
    private patientProfileModel: typeof PatientProfile,
    private readonly aiService: PatientProfileAiService,
  ) {}

  async create(createPatientProfileDto: CreatePatientProfileDto): Promise<any> {
    const patientProfile = await this.patientProfileModel.create(
      createPatientProfileDto as any,
    );
    return {
      success: true,
      message: 'Patient profile created successfully',
      data: patientProfile,
    };
  }

  async findAll(): Promise<any> {
    const patientProfiles = await this.patientProfileModel.findAll();
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
    chiefComplaint: string,
  ): Promise<GeneratedPatientProfile> {
    return await this.aiService.generatePatientProfile({
      diagnosis_id: diagnosisId,
      chief_complaint: chiefComplaint,
    });
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
}
