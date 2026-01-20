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
import { Cluster } from './cluster.model';

@Table({
  tableName: 'diagnoses',
  timestamps: false,
})
export class Diagnosis extends Model<Diagnosis> {
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

  @ForeignKey(() => Cluster)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare clusterId: number | null;

  @BelongsTo(() => Cluster)
  declare cluster: Cluster;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;
}

