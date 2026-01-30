import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PatientProfileController } from './patient-profile.controller';
import { PatientProfileService } from './patient-profile.service';
import { PatientProfileAiService } from './patient-profile-ai.service';
import { PatientProfile } from '../models/patient-profile.model';
import { Symptoms } from '../models/symptoms.model';
import { Treatments } from '../models/treatments.model';
import { Diagnosis } from '../models/diagnosis.model';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PatientProfile,
      Symptoms,
      Treatments,
      Diagnosis,
    ]),
    AuthModule,
  ],
  controllers: [PatientProfileController],
  providers: [
    PatientProfileService,
    PatientProfileAiService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class PatientProfileModule {}
