import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
} from "class-validator";
import { tonalities, keys } from "@prisma/client";

export class UpsertEstiloRequestDto {
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(tonalities)
  tonality: tonalities;

  @IsNotEmpty()
  @IsEnum(keys)
  key: keys;

  @IsNotEmpty()
  origin: string;

  @IsNotEmpty()
  @IsDateString()
  origin_date: string;

  @IsOptional()
  @IsInt()
  palo_id?: number;

  @IsOptional()
  @IsInt()
  artist_id?: number;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}

export class EstiloResponseDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(tonalities)
  tonality: tonalities;

  @IsNotEmpty()
  @IsEnum(keys)
  key: keys;

  @IsOptional()
  @IsString()
  artist_name?: string;

  @IsOptional()
  @IsString()
  palo_name?: string;

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
}
