import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  IsString,
  IsDateString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

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

export class UpsertCompasResponseDto {
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

export class DeleteCompasRequestDto {
  @IsNotEmpty()
  id: number;
}

export class DeleteCompasResponseDto {
  @IsNotEmpty()
  id: number;
}

export class Compas {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;
}

export class GetCompasResponseDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Compas)
  compas: Compas[];
}
