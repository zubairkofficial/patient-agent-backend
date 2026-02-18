import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
} from 'sequelize-typescript';
import { Course } from './course.model';
import { User } from './user.model';

@Table({
  tableName: 'classes',
  timestamps: false,
})
export class Class extends Model<Class> {
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

  @HasMany(() => Course)
  declare courses: Course[];

  @HasMany(() => User)
  declare users: User[];
}
