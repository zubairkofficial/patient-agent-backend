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
import { Cluster } from './cluster.model';

@Table({
  tableName: 'treatments',
  timestamps: false,
})
export class Treatments extends Model<Treatments> {
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

  @ForeignKey(() => Diagnosis)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare diagnosisId: number | null;

  @BelongsTo(() => Diagnosis)
  declare diagnosis: Diagnosis;

  @ForeignKey(() => Cluster)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare clusterId: number | null;

  @BelongsTo(() => Cluster)
  declare cluster: Cluster;
}

