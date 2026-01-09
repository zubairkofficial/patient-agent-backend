import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';
import { TreatmentType } from './enums/treatment-type.enum';

@Table({
  tableName: 'treatments',
  timestamps: false,
})
export class Treatments extends Model<Treatments> {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare label: string;

  @Column({
    type: DataType.ENUM(...Object.values(TreatmentType)),
    allowNull: false,
  })
  declare type: TreatmentType;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;
}

