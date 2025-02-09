import { IsNotEmpty, IsOptional, IsArray, IsDateString } from "class-validator";

export class UpsertLetraRequestDto {
  @IsOptional()
  id?: number;

  @IsOptional()
  estilo_id?: number;

  @IsOptional()
  artist_id?: number;

  @IsOptional()
  palo_id?: number;

  @IsNotEmpty()
  @IsArray()
  verses: string[];

  @IsNotEmpty()
  @IsArray()
  rhyme_scheme: number[];

  @IsNotEmpty()
  @IsArray()
  repetition_pattern: number[];

  @IsNotEmpty()
  structure: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}

export class UpsrtLetraResponseDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  estilo_id: number;

  @IsOptional()
  artist_id?: number;

  @IsOptional()
  palo_id?: number;

  @IsNotEmpty()
  @IsArray()
  verses: string[];

  @IsNotEmpty()
  @IsArray()
  rhyme_scheme: number[];

  @IsNotEmpty()
  @IsArray()
  repetition_pattern: number[];

  @IsNotEmpty()
  structure: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}
