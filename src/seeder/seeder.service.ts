import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as fs from 'fs';
import * as path from 'path';
import { Model, ModelStatic } from 'sequelize';
import { Diagnosis } from 'src/models/diagnosis.model';
import { Symptoms } from 'src/models/symptoms.model';
import { Treatments } from 'src/models/treatments.model';
import diagnosisJSON from './seeder-data/diagnosis.json';
import symptomsJSON from './seeder-data/symptoms.json';
import treatmentsJSON from './seeder-data/treatments.json';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(Treatments) private readonly treatmentModel: typeof Treatments,
    @InjectModel(Diagnosis) private readonly diagnosisModel: typeof Diagnosis,
    @InjectModel(Symptoms) private readonly symptomModel: typeof Symptoms,
  ) {}

  private async seedFromFile<T extends Model>(
    model: ModelStatic<T>,
    data: any,
  ) {
    console.log(`Seeding data for model: ${model.name}`);

    await model.bulkCreate(data, {
      validate: true,
      ignoreDuplicates: true,
    });

    console.log(`Seeding completed for model: ${model.name}`);
  }

  async runAllSeeders() {
    await this.seedFromFile(this.treatmentModel, treatmentsJSON);
    await this.seedFromFile(this.diagnosisModel, diagnosisJSON);
    await this.seedFromFile(this.symptomModel, symptomsJSON);
    console.log('All seeders completed!');
  }
}
