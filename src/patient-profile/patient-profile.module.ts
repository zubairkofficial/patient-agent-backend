import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PatientProfileController } from './patient-profile.controller';
import { PatientProfileService } from './patient-profile.service';
import { PatientProfileAiService } from './patient-profile-ai.service';
import { PatientProfile } from '../models/patient-profile.model';
import { Symptoms } from '../models/symptoms.model';
import { Treatments } from '../models/treatments.model';
import { Diagnosis } from '../models/diagnosis.model';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

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
  providers: [
    PatientProfileService,
    PatientProfileAiService,
    JwtService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class PatientProfileModule {}
