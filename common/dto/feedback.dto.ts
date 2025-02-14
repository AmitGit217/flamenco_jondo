import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";
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

export class GetFeedbackResponseDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackDto)
  feedback: FeedbackDto[];
}
