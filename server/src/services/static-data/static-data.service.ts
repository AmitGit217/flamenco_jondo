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

export interface SearchResult {
  category: string;
  data: any[];
}

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
    data.forEach((item) => {
      delete item.user_create_id;
      delete item.user_update_id;
    });

    return { [type]: data };
  }

  async universalSearch(query: string): Promise<SearchResult[]> {
    const tables = ['palo']; // TODO: add more tables

    // Normalize query: remove accents and convert to lowercase
    const normalizedQuery = this.removeAccents(query.toLowerCase());

    const results = await Promise.all(
      tables.map(async (table) => {
        const data = await this.prisma.$queryRawUnsafe(
          // The 0.3 is the threshold for the similarity
          `
          SELECT * FROM "${table}" 
          WHERE SIMILARITY(LOWER(UNACCENT(name)), UNACCENT($1)) > 0.3 
          OR UNACCENT(name) ILIKE UNACCENT($2)
          ORDER BY SIMILARITY(LOWER(UNACCENT(name)), UNACCENT($1)) DESC
          LIMIT 10
        `,
          normalizedQuery,
          `%${normalizedQuery}%`,
        );

        return { category: `${table}s`, data } as SearchResult;
      }),
    );

    return results.filter((section) => section.data.length > 0);
  }

  private removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
