import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'otps',
  timestamps: true,
  updatedAt: false,
})
export class Otp extends Model<Otp> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'password_reset',
  })
  type: string; // 'password_reset' | 'email_verification'

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUsed: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;
}

