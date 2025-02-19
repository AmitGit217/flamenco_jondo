import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsInt,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
export class UpsertLetraRequestDto {
  @IsOptional()
  id?: number;

  @IsOptional()
  estilo_id?: number;

  @IsOptional()
  name?: string;
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

  @IsOptional()
  @IsInt()
  user_create_id?: number;

  @IsOptional()
  @IsInt()
  user_update_id?: number;
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

export class DeleteLetraRequestDto {
  @IsNotEmpty()
  id: number;
}

export class DeleteLetraResponseDto {
  @IsNotEmpty()
  id: number;
}

export class UpsertLetraArtistRequestDto {
  @IsNotEmpty()
  letra_id: number;

  @IsNotEmpty()
  artist_id: number;

  @IsOptional()
  recording_file?: string;

  @IsOptional()
  album?: string;

  @IsOptional()
  year?: number;
}

export class UpsertLetraArtistResponseDto {
  @IsNotEmpty()
  letra_id: number;

  @IsNotEmpty()
  artist_id: number;
}

export class GetLetrasResponseDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsrtLetraResponseDto)
  letras: UpsrtLetraResponseDto[];
}

export class GetLetraArtistResponseDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertLetraArtistResponseDto)
  letras: UpsertLetraArtistResponseDto[];
}
