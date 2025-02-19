import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpsertArtistRequestDto,
  UpsertArtistResponseDto,
  DeleteArtistRequestDto,
  DeleteArtistResponseDto,
} from '@common/dto/artist.dto';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertArtistRequestDto): Promise<UpsertArtistResponseDto> {
    try {
      const { id, user_create_id, user_update_id, ...artistData } = dto;

      const artist = await this.prisma.artist.upsert({
        where: { id: id || -1 },
        update: {
          ...artistData,
          updated_at: new Date(),
          // ✅ Only connect if user_update_id is defined
          ...(user_update_id
            ? {
                user_artist_user_update_idTouser: {
                  connect: { id: user_update_id },
                },
              }
            : {}),
        },
        create: {
          ...artistData,
          created_at: new Date(),
          updated_at: new Date(),
          // ✅ Only connect if user_create_id is defined
          user_artist_user_create_idTouser: {
            connect: { id: user_create_id || -1 },
          },
        },
      });

      return {
        id: artist.id,
        name: artist.name,
        birth_year: artist.birth_year,
        death_year: artist.death_year,
        origin: artist.origin,
        type: artist.type,
        created_at: artist.created_at?.toISOString() || null,
        updated_at: artist.updated_at?.toISOString() || null,
        user_create_id: artist.user_create_id,
        user_update_id: artist.user_update_id || null,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upsert artist: ${error.message}`,
      );
    }
  }

  async delete(dto: DeleteArtistRequestDto): Promise<DeleteArtistResponseDto> {
    try {
      await this.prisma.artist.delete({
        where: { id: dto.id },
      });

      return {
        id: dto.id,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete artist: ${error.message}`,
      );
    }
  }
}
