import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertEstiloRequestDto } from '@common/dto/estilo.dto';

@Injectable()
export class EstiloService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertEstiloRequestDto) {
    // ✅ Ensure user_created_id is always provided for new Estilo creation
    if (!dto.id && !dto.user_created_id) {
      throw new BadRequestException(
        'user_created_id is required to create an Estilo',
      );
    }

    const upsertData: any = {
      name: dto.name,
      tonality: dto.tonality,
      key: dto.key,
      origin: dto.origin,
      origin_date: dto.origin_date ? new Date(dto.origin_date) : null,
      updated_at: new Date(),
      ...(dto.user_update_id
        ? {
            user_estilo_user_update_idTouser: {
              connect: { id: dto.user_update_id },
            },
          }
        : {}),
      ...(dto.artist_id
        ? { artist_estilo: { connect: { id: dto.artist_id } } }
        : {}),
    };

    if (!dto.id) {
      // ✅ Create new Estilo with `palo_estilo`
      return await this.prisma.estilo.create({
        data: {
          ...upsertData,
          created_at: new Date(),
          user_estilo_user_create_idTouser: {
            connect: { id: dto.user_created_id },
          },
          ...(dto.palo_id
            ? {
                palo_estilo: {
                  create: {
                    palo: { connect: { id: dto.palo_id } },
                    user_palo_estilo_user_create_idTouser: {
                      connect: { id: dto.user_created_id },
                    },
                    created_at: new Date(),
                    updated_at: new Date(),
                  },
                },
              }
            : {}),
        },
      });
    }

    // ✅ Update existing Estilo
    return await this.prisma.estilo.update({
      where: { id: dto.id },
      data: {
        ...upsertData,
        user_estilo_user_update_idTouser: {
          connect: { id: dto.user_update_id },
        },
        palo_estilo: {
          deleteMany: {}, // Remove previous relationships
          ...(dto.palo_id
            ? {
                create: {
                  palo: { connect: { id: dto.palo_id } },
                  user_palo_estilo_user_create_idTouser: {
                    connect: { id: dto.user_update_id },
                  },
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              }
            : {}),
        },
      },
    });
  }
}
