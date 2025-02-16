import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
} from "class-validator";
import { artisttype, estilo } from "@prisma/client";
import { Type } from "class-transformer";

export class UpsertArtistRequestDto {
  @IsOptional()
  id?: number;

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

  @IsOptional()
  @IsInt()
  user_create_id?: number;

  @IsOptional()
  @IsInt()
  user_update_id?: number;
}

export class UpsertArtistResponseDto {
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
  estilos?: Array<estilo>;

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

export class DeleteArtistRequestDto {
  @IsNotEmpty()
  id: number;
}

export class DeleteArtistResponseDto {
  @IsNotEmpty()
  id: number;
}

export class Artist {
  @IsNotEmpty()
  id: number;

  name: string;
}

export class GetArtistsResponseDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Artist)
  artists: Artist[];
}
