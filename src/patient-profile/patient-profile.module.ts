import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PatientProfileController } from './patient-profile.controller';
import { PatientProfileService } from './patient-profile.service';
import { PatientProfileAiService } from './patient-profile-ai.service';
import { PatientProfile } from '../models/patient-profile.model';
import { Symptoms } from '../models/symptoms.model';
import { Treatments } from '../models/treatments.model';
import { Diagnosis } from '../models/diagnosis.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PatientProfile,
      Symptoms,
      Treatments,
      Diagnosis,
    ]),
  ],
  controllers: [PatientProfileController],
  providers: [PatientProfileService, PatientProfileAiService],
})
export class PatientProfileModule {}
