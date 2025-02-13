import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FeedbackDto {
  @IsOptional()
  user_id?: number;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsString()
  email: string;
}

export class FeedbackResponseDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
