import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpsertCompasRequestDto,
  CompasResponseDto,
} from '@common/dto/compas.dto';

@Injectable()
export class CompasService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertCompasRequestDto): Promise<CompasResponseDto> {
    try {
      const timestamp = new Date();

      const compas = await this.prisma.compas.upsert({
        where: { id: dto.id || -1 }, // ✅ Use -1 for safer upserts
        update: {
          name: dto.name,
          beats: dto.beats,
          accents: dto.accents,
          silences: dto.silences,
          time_signatures: dto.time_signatures,
          bpm: dto.bpm,
          updated_at: timestamp,
          ...(dto.user_update_id
            ? {
                user_compas_user_update_idTouser: {
                  connect: { id: dto.user_update_id },
                },
              }
            : {}),
        },
        create: {
          name: dto.name,
          beats: dto.beats,
          accents: dto.accents,
          silences: dto.silences,
          time_signatures: dto.time_signatures,
          bpm: dto.bpm,
          created_at: timestamp,
          updated_at: timestamp,
          user_compas_user_create_idTouser: {
            connect: { id: dto.user_create_id || -1 },
          },
          ...(dto.user_update_id
            ? {
                user_compas_user_update_idTouser: {
                  connect: { id: dto.user_update_id },
                },
              }
            : {}),
        },
      });

      return {
        id: compas.id,
        name: compas.name,
        beats: compas.beats,
        accents: compas.accents,
        silences: compas.silences,
        time_signatures: compas.time_signatures,
        bpm: compas.bpm,
        created_at: compas.created_at?.toISOString() || null,
        updated_at: compas.updated_at?.toISOString() || null,
        user_create_id: compas.user_create_id,
        user_update_id: compas.user_update_id || null,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upsert Compás: ${error.message}`,
      );
    }
  }
}
