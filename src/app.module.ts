import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { SymptomsModule } from './symptoms/symptoms.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { OperationsModule } from './operations/operations.module';
import { User } from './models/user.model';
import { Otp } from './models/otp.model';
import { Diagnosis } from './models/diagnosis.model';
import { Symptoms } from './models/symptoms.model';
import { Treatments } from './models/treatments.model';
import { SeederModule } from './seeder/seeder.module';
import { PatientProfileModule } from './patient-profile/patient-profile.module';
import { GradingChatModule } from './grading-chat/grading-chat.module';
import { ClassModule } from './class/class.module';
import { CourseModule } from './course/course.module';
import { Course } from './models/course.model';
import { Class } from './models/class.model';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'patient_agent',
      autoLoadModels: true,
      models: [
        User,
        Otp,
        Diagnosis,
        Symptoms,
        Treatments,
        Course,
        Class,
      ],
      synchronize:
        process.env.DB_SYNCHRONIZE === 'true' ||
        process.env.NODE_ENV !== 'production',
      logging: true,
      sync: {
        force: false,
        alter: process.env.NODE_ENV === 'development',
      },
      retryDelay: 3000,
    }),

    AuthModule,
    DiagnosisModule,
    SymptomsModule,
    TreatmentsModule,
    OperationsModule,
    SeederModule,
    PatientProfileModule,
    GradingChatModule,
    ClassModule,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
