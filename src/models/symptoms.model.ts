import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  Unique,
} from 'sequelize-typescript';
import { SeverityScale } from './severity-scale.model';

@Table({
  tableName: 'symptoms',
  timestamps: false,
})
export class Symptoms extends Model<Symptoms> {
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
    unique: true,
  })
  declare code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @HasMany(() => SeverityScale, {
    foreignKey: 'symptomId',
    sourceKey: 'id',
  })
  declare severityScales: SeverityScale[];
}

