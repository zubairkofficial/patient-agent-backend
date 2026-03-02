import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Model, ModelStatic } from 'sequelize';
import { Diagnosis } from 'src/models/diagnosis.model';
import { Symptoms } from 'src/models/symptoms.model';
import { Treatments } from 'src/models/treatments.model';
import diagnosisJSON from './seeder-data/diagnosis.json';
import symptomsJSON from './seeder-data/symptoms.json';
import treatmentsJSON from './seeder-data/treatments.json';
import { User } from 'src/models/user.model';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/auth/roles.enum';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(Treatments) private readonly treatmentModel: typeof Treatments,
    @InjectModel(Diagnosis) private readonly diagnosisModel: typeof Diagnosis,
    @InjectModel(Symptoms) private readonly symptomModel: typeof Symptoms,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  private async seedAdminUser() {
    const adminUserExist = await this.userModel.findOne({
      where: {
        email: 'admin@gmail.com',
      },
    });
    const password = process.env.ADMIN_PASSWORD_DEFAULT;

    if (!password) {
      console.warn(
        'ADMIN_PASSWORD_DEFAULT is not set in .env. Using default password: 12345678',
      );
      return;
    }
    const hashedPassword = await bcrypt.hash(`${password}`, 10);
    if (!adminUserExist) {
      await this.userModel.create({
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: Roles.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        emailVerified: true,
        classId: null,
      } as any);
    }
  }
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
    await this.seedAdminUser();
    console.log('All seeders completed!');
  }
}
