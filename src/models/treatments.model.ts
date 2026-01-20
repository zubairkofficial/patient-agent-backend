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
  BeforeValidate,
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

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
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

  @BeforeValidate
  static transformCode(instance: Treatments) {
    if (instance.code) {
      instance.code = instance.code.toUpperCase().replace(/\s+/g, '_');
    }
  }
}

