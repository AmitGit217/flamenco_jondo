import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpsertEstiloRequestDto,
  UpsertEstiloResponseDto,
} from '@common/dto/estilo.dto';

@Injectable()
export class EstiloService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertEstiloRequestDto): Promise<UpsertEstiloResponseDto> {
    try {
      const timestamp = new Date();

      const upsertData = {
        name: dto.name,
        tonality: dto.tonality,
        key: dto.key,
        origin: dto.origin,
        origin_date: dto.origin_date ? new Date(dto.origin_date) : null,
        updated_at: timestamp,
        ...(dto.user_update_id
          ? {
              user_estilo_user_update_idTouser: {
                connect: { id: dto.user_update_id },
              },
            }
          : {}),
        ...(dto.artist_id
          ? {
              artist_estilo: {
                connect: { id: dto.artist_id },
              },
            }
          : {}),
      };

      const estilo = await this.prisma.estilo.upsert({
        where: { id: dto.id || -1 },
        update: {
          ...upsertData,
          palo_estilo: {
            deleteMany: {}, // ✅ Ensures existing palo_estilo relations are reset
            ...(dto.palo_id
              ? {
                  create: {
                    palo: { connect: { id: dto.palo_id } },
                    user_palo_estilo_user_create_idTouser: {
                      connect: { id: dto.user_update_id || -1 },
                    },
                    created_at: timestamp,
                    updated_at: timestamp,
                  },
                }
              : {}),
          },
        },
        create: {
          ...upsertData,
          created_at: timestamp,
          user_estilo_user_create_idTouser: {
            connect: { id: dto.user_created_id || -1 },
          },
          palo_estilo: dto.palo_id
            ? {
                create: {
                  palo: { connect: { id: dto.palo_id } },
                  user_palo_estilo_user_create_idTouser: {
                    connect: { id: dto.user_created_id || -1 },
                  },
                  created_at: timestamp,
                  updated_at: timestamp,
                },
              }
            : undefined,
        },
      });

      return {
        ...estilo,
        origin_date: estilo.origin_date
          ? estilo.origin_date.toISOString()
          : null,
        created_at: estilo.created_at ? estilo.created_at.toISOString() : null,
        updated_at: estilo.updated_at ? estilo.updated_at.toISOString() : null,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upsert estilo: ${error.message}`,
      );
    }
  }
}
