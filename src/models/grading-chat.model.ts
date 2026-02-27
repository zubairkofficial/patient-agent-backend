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
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { PatientProfile } from './patient-profile.model';
import { ChatMessage } from './chat-message.model';

@Table({
  tableName: 'grading-chats',
  timestamps: true,
})
export class GradingChat extends Model<GradingChat> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @Unique('user_patient_unique')
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User, { onDelete: 'CASCADE' })
  declare user: User;

  @Unique('user_patient_unique')
  @ForeignKey(() => PatientProfile)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare patientProfileId: number;

  @BelongsTo(() => PatientProfile)
  declare patientProfile: PatientProfile;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare agentRemarks: AgentRemarks;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  declare totalScore: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isCompleted: boolean;

  @HasMany(() => ChatMessage, { onDelete: 'CASCADE' })
  declare chatMessages: ChatMessage[];
}

export interface AgentRemarks {
  interviewFeedback: InterviewFeedback;
  correctedDiagnosis: DiagnosisFeedback;
  treatmentFeedback: TreatmentFeedback;
  noteImprovementGuidance: string;
}

interface InterviewFeedback {
  strengths: string[];
  areasForImprovement: string[];
  missedQuestions: string[];
}

interface DiagnosisFeedback {
  studentDiagnosis: string;
  correctDiagnosis: string;
  rationale: string;
  diagnosticCriteriaMissed: string[];
}

interface TreatmentFeedback {
  studentTreatment: string;
  issues: string[];
  recommendedAlternatives: string[];
  evidenceBasedRationale: string;
}
