import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileTemplateService } from './profile-template.service';
import { ProfileTemplateController } from './profile-template.controller';
import { ProfileTemplate } from '../models/profile-template.model';
import { Diagnosis } from '../models/diagnosis.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ProfileTemplate, Diagnosis]),
    AuthModule,
  ],
  controllers: [ProfileTemplateController],
  providers: [ProfileTemplateService, JwtAuthGuard, RolesGuard],
  exports: [ProfileTemplateService],
})
export class ProfileTemplateModule {}
