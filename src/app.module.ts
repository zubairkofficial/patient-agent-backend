import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './models/user.model';
import { Otp } from './models/otp.model';
import { Cluster } from './models/cluster.model';
import { Diagnosis } from './models/diagnosis.model';
import { Symptoms } from './models/symptoms.model';
import { Treatments } from './models/treatments.model';
import { SeverityScale } from './models/severity-scale.model';

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
      models: [User, Otp, Cluster, Diagnosis, Symptoms, Treatments, SeverityScale],
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV !== 'production',
      logging: true,
      sync: {
        force: false,
        alter: process.env.NODE_ENV === 'development',
      },
      retryDelay: 3000,
    }),

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
