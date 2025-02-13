import { Body, Controller, Post } from '@nestjs/common';
import { FeedbackDto, FeedbackResponseDto } from '@common/dto/feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Body() feedbackDto: FeedbackDto): Promise<FeedbackResponseDto> {
    return this.feedbackService.create(feedbackDto);
  }
}
