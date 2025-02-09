import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  IsString,
  IsDateString,
} from "class-validator";

export class UpsertCompasRequestDto {
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  beats: number;

  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  accents: number[];

  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  silences: number[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  time_signatures: string[];

  @IsNotEmpty()
  @IsInt()
  bpm: number;

  @IsNotEmpty()
  @IsInt()
  user_create_id: number;

  @IsOptional()
  @IsInt()
  user_update_id?: number;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}

export class CompasResponseDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  beats: number;

  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  accents: number[];

  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  silences: number[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  time_signatures: string[];

  @IsNotEmpty()
  bpm: number;

  @IsNotEmpty()
  user_create_id: number;

  @IsOptional()
  user_update_id?: number;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}
