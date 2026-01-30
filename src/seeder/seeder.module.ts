import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Treatments } from 'src/models/treatments.model';
import { Diagnosis } from 'src/models/diagnosis.model';
import { Symptoms } from 'src/models/symptoms.model';

@Module({
  imports: [SequelizeModule.forFeature([Treatments, Diagnosis, Symptoms])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
