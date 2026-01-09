import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  HasMany,
} from 'sequelize-typescript';
import { SeverityScale } from './severity-scale.model';

@Table({
  tableName: 'symptoms',
  timestamps: false,
})
export class Symptoms extends Model<Symptoms> {
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
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @HasMany(() => SeverityScale, {
    foreignKey: 'symptomCode',
    sourceKey: 'code',
  })
  declare severityScales: SeverityScale[];
}

