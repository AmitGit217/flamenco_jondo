import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpsertArtistRequestDto,
  UpsertArtistResponseDto,
} from '@common/dto/artist.dto';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertArtistRequestDto): Promise<UpsertArtistResponseDto> {
    try {
      const { id, user_created_id, user_update_id, ...artistData } = dto;

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
          // ✅ Only connect if user_created_id is defined
          user_artist_user_create_idTouser: {
            connect: { id: user_created_id || -1 },
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
        user_created_id: artist.user_create_id,
        user_update_id: artist.user_update_id || null,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upsert artist: ${error.message}`,
      );
    }
  }
}
