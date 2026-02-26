import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
  Unique,
  HasMany,
} from 'sequelize-typescript';
import { Class } from './class.model';
import { PatientProfile } from './patient-profile.model';

@Table({
  tableName: 'courses',
  timestamps: false,
})
export class Course extends Model<Course> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare classId: number;

  @BelongsTo(() => Class)
  declare class: Class;

  @HasMany(() => PatientProfile)
  declare patient_profiles: PatientProfile[];
}
