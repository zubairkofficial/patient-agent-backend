import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Class } from './class.model';

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
}
