import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Class } from 'src/models/class.model';
import { PatientProfile } from 'src/models/patient-profile.model';
import { AuthModule } from 'src/auth/auth.module';
import { Course } from 'src/models/course.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Course, Class, PatientProfile]),
    AuthModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
