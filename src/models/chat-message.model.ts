import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { GradingChat } from './grading-chat.model';

@Table({
  tableName: 'chat_messages',
  timestamps: true,
})
export class ChatMessage extends Model<ChatMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => GradingChat)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare gradingChatId: number;

  @BelongsTo(() => GradingChat)
  declare gradingChat: GradingChat;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare agent: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  declare score: number | null;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare metadata: Record<string, any> | null;
}
