import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  IsDateString,
} from "class-validator";
import { artisttype } from "@prisma/client";

export class CreateArtistRequestDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsInt()
  birth_year?: number;

  @IsOptional()
  @IsInt()
  death_year?: number;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsNotEmpty()
  @IsEnum(artisttype)
  type: artisttype;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}

export class ArtistResponseDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsInt()
  birth_year?: number;

  @IsOptional()
  @IsInt()
  death_year?: number;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsNotEmpty()
  @IsEnum(artisttype)
  type: artisttype;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}
