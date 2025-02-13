import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FeedbackDto, FeedbackResponseDto } from '@common/dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(feedbackDto: FeedbackDto): Promise<FeedbackResponseDto> {
    try {
      await this.prisma.feedback.create({
        data: {
          comment: feedbackDto.comment,
          email: feedbackDto.email,
          ...(feedbackDto.user_id && { user_id: feedbackDto.user_id }),
        },
      });

      return {
        message: 'Feedback created successfully',
      };
    } catch (error) {
      throw new Error('Failed to create feedback');
    }
  }
}
