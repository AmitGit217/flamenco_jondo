import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertEstiloRequestDto } from '@common/dto/estilo.dto';

@Injectable()
export class EstiloService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertEstiloRequestDto) {
    const timestamp = new Date();

    const upsertData = {
      name: dto.name,
      tonality: dto.tonality,
      key: dto.key,
      origin: dto.origin,
      origin_date: dto.origin_date ? new Date(dto.origin_date) : null,
      updated_at: timestamp,
      user_estilo_user_update_idTouser: dto.user_update_id
        ? { connect: { id: dto.user_update_id } }
        : undefined,
      artist_estilo: dto.artist_id
        ? { connect: { id: dto.artist_id } }
        : undefined,
    };

    if (!dto.id) {
      return this.prisma.estilo.create({
        data: {
          ...upsertData,
          created_at: timestamp,
          user_estilo_user_create_idTouser: {
            connect: { id: dto.user_created_id },
          },
          palo_estilo: dto.palo_id
            ? {
                create: {
                  palo: { connect: { id: dto.palo_id } },
                  user_palo_estilo_user_create_idTouser: {
                    connect: { id: dto.user_created_id },
                  },
                  created_at: timestamp,
                  updated_at: timestamp,
                },
              }
            : undefined,
        },
      });
    }

    return this.prisma.estilo.update({
      where: { id: dto.id },
      data: {
        ...upsertData,
        palo_estilo: {
          deleteMany: {},
          create: dto.palo_id
            ? {
                palo: { connect: { id: dto.palo_id } },
                user_palo_estilo_user_create_idTouser: {
                  connect: { id: dto.user_update_id },
                },
                created_at: timestamp,
                updated_at: timestamp,
              }
            : undefined,
        },
      },
    });
  }
}
