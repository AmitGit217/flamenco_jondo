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
    query?: string,
  ): Promise<{ [key: string]: StaticDataResponseDto[] }> {
    const whereCondition = query
      ? { name: { contains: query, mode: 'insensitive' } }
      : {}; // If no query, return all records

    const data = await this.prisma[type].findMany({
      where: whereCondition, // Apply where condition only if query exists
    });

    return { [type]: data };
  }

  async universalSearch(query: string) {
    const tables = ['palo', 'estilo', 'artist', 'letra'];

    const results = await Promise.all(
      tables.map(async (table) => {
        const data = await this.prisma[table].findMany({
          where: {
            name: { contains: query, mode: 'insensitive' },
          },
        });
        return { category: `${table}s`, data };
      }),
    );

    return results.filter((section) => section.data.length > 0); // Remove empty categories
  }
}
