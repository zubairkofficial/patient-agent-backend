import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Symptoms } from './symptoms.model';

@Table({
  tableName: 'severity_scales',
  timestamps: false,
})
export class SeverityScale extends Model<SeverityScale> {
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

  @ForeignKey(() => Symptoms)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare symptomCode: string;

  @BelongsTo(() => Symptoms, {
    foreignKey: 'symptomCode',
    targetKey: 'code',
  })
  declare symptom: Symptoms;
}

