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
import { Diagnosis } from './diagnosis.model';

// JSON Schema Type Definitions
export interface SymptomRequiredItem {
  symptom_id: number;
  symptom_code: number;
  severity_scale_id: number;
}

export interface SymptomPresentTypicalItem {
  symptom_id: number;
  symptom_code: number;
  severity_scale_id: number;
  p_present: number;
}

export interface SymptomOptionalItem {
  symptom_id: number;
  symptom_code: number;
  severity_scale_id: number;
  p_present: number;
}

export interface SymptomAbsentTypicalItem {
  symptom_id: number;
  symptom_code: number;
}

@Table({
  tableName: 'profile_templates',
  timestamps: false,
})
export class ProfileTemplate extends Model<ProfileTemplate> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare seed: number;

  @ForeignKey(() => Diagnosis)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare diagnosis_id: number;

  @BelongsTo(() => Diagnosis, {
    foreignKey: 'diagnosis_id',
    targetKey: 'id',
  })
  declare diagnosis: Diagnosis;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare symptoms_required: SymptomRequiredItem[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare symptoms_present_typical: SymptomPresentTypicalItem[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare symptoms_optional: SymptomOptionalItem[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare symptoms_absent_typical: SymptomAbsentTypicalItem[];
}
