import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { tonalities, keys } from "@prisma/client";

export class UpsertEstiloRequestDto {
  @IsOptional()
  @IsInt()
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

  @IsOptional()
  @IsInt()
  user_create_id?: number;

  @IsOptional()
  @IsInt()
  user_update_id?: number;
}

export class UpsertEstiloResponseDto {
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

export class DeleteEstiloRequestDto {
  @IsNotEmpty()
  id: number;
}

export class DeleteEstiloResponseDto {
  @IsNotEmpty()
  id: number;
}

export class Estilo {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;
}

export class GetEstilosResponseDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Estilo)
  estiols: Estilo[];
}
