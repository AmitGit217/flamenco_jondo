import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetPalosResponseDto } from '@common/dto/palo.dto';
import { GetEstilosResponseDto } from '@common/dto/estilo.dto';
import { GetArtistsResponseDto } from '@common/dto/artist.dto';
import { GetCompasResponseDto } from '@common/dto/compas.dto';
import {
  GetLetraArtistResponseDto,
  GetLetrasResponseDto,
} from '@common/dto/letra.dto';

type StaticDataResponseDto =
  | GetPalosResponseDto
  | GetEstilosResponseDto
  | GetArtistsResponseDto
  | GetCompasResponseDto
  | GetLetrasResponseDto
  | GetLetraArtistResponseDto;

@Injectable()
export class StaticDataService {
  constructor(private readonly prisma: PrismaService) {}

  async getTableByType(
    type: string,
  ): Promise<{ [key: string]: StaticDataResponseDto }> {
    const data = await this.prisma[type].findMany();
    return { [type]: data };
  }
}
