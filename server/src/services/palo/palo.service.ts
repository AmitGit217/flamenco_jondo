import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstiloDto } from '../../../../common/dto/palo.dto';
import {
  DeletePaloResponseDto,
  GetPaloResponseDto,
  UpsertPaloRequestDto,
  UpsertPaloResponseDto,
} from '@common/dto/palo.dto';
import { StorageService } from '../storage/storage.service';
@Injectable()
export class PaloService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async upsertPalo(
    dto: UpsertPaloRequestDto,
    userId: number,
  ): Promise<UpsertPaloResponseDto> {
    try {
      const timestamp = new Date();

      const palo = await this.prismaService.palo.upsert({
        where: { id: dto.id || -1 }, // ✅ Use -1 to prevent accidental match
        update: {
          name: dto.name,
          origin: dto.origin,
          origin_date: dto.origin_date ? new Date(dto.origin_date) : null,
          updated_at: timestamp,
          user_update_id: userId,
        },
        create: {
          name: dto.name,
          origin: dto.origin,
          origin_date: dto.origin_date ? new Date(dto.origin_date) : null,
          created_at: timestamp,
          updated_at: timestamp,
          user_create_id: userId,
          user_update_id: userId,
        },
      });

      return {
        ...palo,
        origin_date: palo.origin_date?.toISOString() || null,
        created_at: palo.created_at?.toISOString() || null,
        updated_at: palo.updated_at?.toISOString() || null,
      };
    } catch (error) {
      throw new Error(`Failed to upsert Palo: ${error.message}`);
    }
  }

  async deletePalo(id: number): Promise<DeletePaloResponseDto> {
    try {
      await this.prismaService.palo.delete({
        where: { id: id },
      });

      return {
        id: id,
      };
    } catch (error) {
      throw new Error(`Failed to delete Palo: ${error.message}`);
    }
  }

  async getPalo(id: number): Promise<GetPaloResponseDto> {
    const palo = await this.prismaService.palo.findUnique({
      where: { id: id },
      include: {
        palo_estilo: {
          include: {
            estilo: {
              include: {
                letra: {
                  include: {
                    letra_artist: {
                      include: {
                        artist: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const mappedEstilos = await Promise.all(
      palo.palo_estilo.map(async (pe) => {
        const letras = await Promise.all(
          pe.estilo.letra.map(async (letra) => {
            const recording_base64 = await this.storageService.getFile(
              letra.letra_artist[0]?.recording_url,
            );
            return {
              id: letra.id,
              content: letra.verses.join('\n'),
              artist: letra.letra_artist[0]?.artist.name || '',
              recording: recording_base64 || '',
            };
          }),
        );

        return {
          id: pe.estilo.id,
          name: pe.estilo.name,
          origin: pe.estilo.origin || '',
          letras,
        };
      }),
    );

    return {
      id: palo.id,
      name: palo.name,
      description: palo.origin || '',
      estilos: mappedEstilos,
    };
  }
}
