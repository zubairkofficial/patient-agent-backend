import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GradingChat } from '../models/grading-chat.model';
import { ChatMessage } from '../models/chat-message.model';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateGradingChatDTO } from './dto/create-grading-chat.dto';
import { PatientProfile } from 'src/models/patient-profile.model';
import PDFDocument from 'pdfkit';

@Injectable()
export class GradingChatService {
  constructor(
    @InjectModel(GradingChat)
    private readonly gradingChatModel: typeof GradingChat,
    @InjectModel(ChatMessage)
    private readonly chatMessageModel: typeof ChatMessage,
  ) {}

  async getChatResultByGradingId(gradingChatId: number, req: any) {
    try {
      const gradingOfInteraction = await this.gradingChatModel.findByPk(
        gradingChatId,
        {
          include: [
            {
              model: PatientProfile,
              attributes: ['id', 'case_metadata', 'primary_diagnosis'],
            },
          ],
        },
      );
      return {
        totalScore: gradingOfInteraction?.totalScore,
        agentRemarks: gradingOfInteraction?.agentRemarks,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve grading result ' + error.message,
        500,
      );
    }
  }

  async getPDFChatResultByGradingId(gradingChatId: number, res: any) {
    try {
      const gradingOfInteraction = await this.gradingChatModel.findByPk(
        gradingChatId,
        {
          include: [
            {
              model: PatientProfile,
              attributes: ['id', 'case_metadata', 'primary_diagnosis'],
            },
          ],
        },
      );

      if (!gradingOfInteraction) {
        throw new HttpException('Grading result not found', 404);
      }

      const { totalScore, agentRemarks } = gradingOfInteraction;

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=grading_result_${gradingChatId}.pdf`,
      );

      doc.pipe(res);

      // Title
      doc.fontSize(22).text('Grading Result', { underline: true });
      doc.moveDown();
      doc.fontSize(14).text(`Total Score: ${totalScore}`);
      doc.moveDown();
      doc
        .fontSize(14)
        .text(
          `Case: ${gradingOfInteraction.patientProfile.case_metadata.case_id}`,
        );
      doc.moveDown();
      // Interview Feedback
      const feedback = agentRemarks?.interviewFeedback;
      if (feedback) {
        doc.fontSize(16).text('Interview Feedback', { underline: true });
        doc.moveDown(0.5);
        feedback.strengths?.forEach((s) => doc.text(`Strength: ${s}`));
        feedback.areasForImprovement?.forEach((a) => doc.text(`Improve: ${a}`));
        feedback.missedQuestions?.forEach((m) => doc.text(`Missed: ${m}`));
        doc.moveDown();
      }

      // Diagnosis
      const diagnosis = agentRemarks?.correctedDiagnosis;
      if (diagnosis) {
        doc.fontSize(16).text('Diagnosis', { underline: true });
        doc.moveDown(0.5);
        doc.text(`Trainee Diagnosis: ${diagnosis.studentDiagnosis}`);
        doc.text(`Correct Diagnosis: ${diagnosis.correctDiagnosis}`);
        doc.text(`Rationale: ${diagnosis.rationale}`);
        doc.moveDown();
      }

      // Treatment
      const treatment = agentRemarks?.treatmentFeedback;
      if (treatment) {
        doc.fontSize(16).text('Treatment', { underline: true });
        doc.moveDown(0.5);
        doc.text(`Trainee Treatment: ${treatment.studentTreatment}`);
        if (treatment.issues?.length) {
          doc.text('Issues:');
          treatment.issues.forEach((issue) => doc.text(`- ${issue}`));
        }
        if (treatment.recommendedAlternatives?.length) {
          doc.text('Recommended Alternatives:');
          treatment.recommendedAlternatives.forEach((alt) =>
            doc.text(`- ${alt}`),
          );
        }
        doc.text(
          `Evidence-Based Rationale: ${treatment.evidenceBasedRationale}`,
        );
        doc.moveDown();
      }

      // Documentation Guidance
      if (agentRemarks?.noteImprovementGuidance) {
        doc.fontSize(16).text('Documentation Guidance', { underline: true });
        doc.moveDown(0.5);
        doc.text(agentRemarks.noteImprovementGuidance);
      }

      doc.end();
    } catch (error: any) {
      throw new HttpException('Failed to generate PDF: ' + error.message, 500);
    }
  }

  async getGradingResultsByUser(userId: number) {
    try {
      const gradingOfInteractions = await this.gradingChatModel.findAll({
        where: { userId, isCompleted: true },
        include: [
          {
            model: PatientProfile,
            attributes: ['id', 'case_metadata', 'primary_diagnosis'],
          },
        ],
      });
      return {
        success: true,
        data: gradingOfInteractions,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve grading results ' + error.message,
        500,
      );
    }
  }

  async createGradingChat(
    createGradingChatDto: CreateGradingChatDTO,
    req: any,
  ) {
    try {
      let gradingChat = await this.gradingChatModel.findOne({
        where: {
          userId: req.user.id,
          patientProfileId: createGradingChatDto.patientProfileId,
        },
      });
      if (!gradingChat) {
        gradingChat = await this.gradingChatModel.create({
          userId: req.user.id,
          patientProfileId: createGradingChatDto.patientProfileId,
        } as any);
      }

      return {
        message: 'Grading chat created successfully',
        gradingChat,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create grading chat ' + error.message,
        500,
      );
    }
  }

  /**
   * Get all chat messages for a user and patient profile
   */
  async getChatsByPatientProfile(
    gradingChatId: number,
  ): Promise<{ messages: ChatMessage[] }> {
    try {
      const gradingChat = await this.gradingChatModel.findOne({
        where: {
          id: gradingChatId,
          isCompleted: false,
        },
      });

      if (!gradingChat) {
        throw new NotFoundException(
          'Grading chat not found or it is completed',
        );
      }

      const messages = await this.chatMessageModel.findAll({
        where: { gradingChatId: gradingChat.id },
        order: [['createdAt', 'ASC']],
      });

      return {
        messages,
      };
    } catch (error) {
      console.log('Error in getChatsByPatientProfile:', error);
      throw new BadRequestException(
        'Failed to retrieve or create grading chat',
      );
    }
  }
}
