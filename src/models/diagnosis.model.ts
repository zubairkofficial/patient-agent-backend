import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Cluster } from './cluster.model';
import { GradingMode } from './enums/grading-mode.enum';

@Table({
  tableName: 'diagnoses',
  timestamps: false,
})
export class Diagnosis extends Model<Diagnosis> {
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

  @ForeignKey(() => Cluster)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare clusterId: number | null;

  @BelongsTo(() => Cluster)
  declare cluster: Cluster;

  @Column({
    type: DataType.ENUM(...Object.values(GradingMode)),
    allowNull: false,
  })
  declare gradingMode: GradingMode;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;
}

