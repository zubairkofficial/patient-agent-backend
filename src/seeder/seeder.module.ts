import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Treatments } from 'src/models/treatments.model';
import { Diagnosis } from 'src/models/diagnosis.model';
import { Symptoms } from 'src/models/symptoms.model';
import { User } from 'src/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Treatments, Diagnosis, Symptoms, User]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
