import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  Length,
} from "class-validator";

export class UpsertPaloRequestDto {
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  origin: string;

  @IsNotEmpty()
  @IsDateString()
  origin_date: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;

  @IsOptional()
  @IsInt()
  user_created_id?: number;

  @IsOptional()
  @IsInt()
  user_update_id?: number;
}

export class UpsertPaloResponseDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  @Length(3, 255)
  name: string;

  @IsNotEmpty()
  origin: string;

  @IsNotEmpty()
  @IsDateString()
  origin_date: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;

  @IsOptional()
  @IsInt()
  user_created_id?: number;

  @IsOptional()
  @IsInt()
  user_update_id?: number;
}

export class DeletePaloRequestDto {
  @IsNotEmpty()
  id: number;
}

export class DeletePaloResponseDto {
  @IsNotEmpty()
  id: number;
}
