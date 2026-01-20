import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
} from 'sequelize-typescript';
import { Diagnosis } from './diagnosis.model';

@Table({
  tableName: 'clusters',
  timestamps: false,
})
export class Cluster extends Model<Cluster> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @HasMany(() => Diagnosis)
  declare diagnoses: Diagnosis[];
}

