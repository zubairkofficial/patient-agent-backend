import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  HasOne,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Roles } from '../auth/roles.enum';
import { Class } from './class.model';
import { GradingChat } from './grading-chat.model';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare lastName: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare emailVerified: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(Roles)),
    allowNull: false,
    defaultValue: Roles.USER,
  })
  declare role: Roles;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare classId: number | null;

  @BelongsTo(() => Class)
  declare class: Class;

  @HasMany(() => GradingChat, { onDelete: 'CASCADE' })
  declare gradingChats: GradingChat[];
}
