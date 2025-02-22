import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  Length,
  ValidateNested,
  IsArray,
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
  user_create_id?: number;

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
  user_create_id?: number;

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

export class Palo {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;
}
export class GetPalosResponseDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Palo)
  palos: Palo[];
}

export class GetPaloResponseDto {
  id: number;
  name: string;
  description: string;
  estilos: EstiloDto[];
}

export class EstiloDto {
  id: number;
  name: string;
  origin: string;
  letras: LetraDto[];
}

export class LetraDto {
  id: number;
  content: string;
  artist: string;
  recording: string;
}
