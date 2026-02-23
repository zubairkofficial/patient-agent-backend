import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Unique,
} from 'sequelize-typescript';
import { User } from './user.model';
import { PatientProfile } from './patient-profile.model';

@Table({
  tableName: 'grading-chats',
  timestamps: true,
})
export class GradingChat extends Model<GradingChat> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @Unique('user_patient_unique')
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @Unique('user_patient_unique')
  @ForeignKey(() => PatientProfile)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare patientProfileId: number;

  @BelongsTo(() => PatientProfile)
  declare patientProfile: PatientProfile;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare agentRemarks: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  declare totalScore: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isCompleted: boolean;
}
