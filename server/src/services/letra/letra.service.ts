import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpsertLetraRequestDto,
  UpsrtLetraResponseDto,
} from '@common/dto/letra.dto';

@Injectable()
export class LetraService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertLetraRequestDto): Promise<UpsrtLetraResponseDto> {
    try {
      const timestamp = new Date();

      // ✅ Step 1: Upsert Letra (without `include`)
      const letra = await this.prisma.letra.upsert({
        where: { id: dto.id || -1 }, // ✅ Use -1 for safe upsert
        update: {
          verses: dto.verses,
          rhyme_scheme: dto.rhyme_scheme,
          repetition_pattern: dto.repetition_pattern,
          structure: dto.structure,
          updated_at: timestamp,
          estilo: {
            connect: { id: dto.estilo_id || -1 },
          },
          ...(dto.user_update_id
            ? {
                user_letra_user_update_idTouser: {
                  connect: { id: dto.user_update_id || -1 },
                },
              }
            : {}),
        },
        create: {
          verses: dto.verses,
          rhyme_scheme: dto.rhyme_scheme,
          repetition_pattern: dto.repetition_pattern,
          structure: dto.structure,
          created_at: timestamp,
          updated_at: timestamp,
          estilo: {
            connect: { id: dto.estilo_id || -1 },
          },
          user_letra_user_create_idTouser: {
            connect: { id: dto.user_created_id || -1 },
          },
          ...(dto.user_update_id
            ? {
                user_letra_user_update_idTouser: {
                  connect: { id: dto.user_update_id || -1 },
                },
              }
            : {}),
        },
      });

      const letraArtists = await this.prisma.letra_artist.findMany({
        where: { letra_id: letra.id },
        select: { artist_id: true },
      });

      const letraPalos = await this.prisma.letra_palo.findMany({
        where: { letra_id: letra.id },
        select: { palo_id: true },
      });

      return {
        id: letra.id,
        estilo_id: dto.estilo_id,
        artist_id: letraArtists.length > 0 ? letraArtists[0].artist_id : null,
        palo_id: letraPalos.length > 0 ? letraPalos[0].palo_id : null,
        verses: letra.verses,
        rhyme_scheme: letra.rhyme_scheme,
        repetition_pattern: letra.repetition_pattern,
        structure: letra.structure,
        created_at: letra.created_at?.toISOString() || null,
        updated_at: letra.updated_at?.toISOString() || null,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upsert Letra: ${error.message}`);
    }
  }
}
