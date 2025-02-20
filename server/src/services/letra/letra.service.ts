import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpsertLetraRequestDto,
  UpsrtLetraResponseDto,
  DeleteLetraRequestDto,
  DeleteLetraResponseDto,
  UpsertLetraArtistRequestDto,
  UpsertLetraArtistResponseDto,
} from '@common/dto/letra.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class LetraService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async upsert(dto: UpsertLetraRequestDto): Promise<UpsrtLetraResponseDto> {
    try {
      const timestamp = new Date();

      const letra = await this.prisma.letra.upsert({
        where: { id: dto.id || -1 },
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
          name: dto.name,
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
            connect: { id: dto.user_create_id || -1 },
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

      const letraPalos = await this.prisma.letra_palo.findMany({
        where: { letra_id: letra.id },
        select: { palo_id: true },
      });

      const letraArtists = await this.prisma.letra_artist.findMany({
        where: { letra_id: letra.id },
        select: { artist_id: true },
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

  async delete(dto: DeleteLetraRequestDto): Promise<DeleteLetraResponseDto> {
    try {
      // Get all recording URLs before deletion
      const letraArtists = await this.prisma.letra_artist.findMany({
        where: { letra_id: dto.id },
        select: { recording_url: true },
      });

      // Delete all database records
      await Promise.all([
        this.prisma.letra_palo.deleteMany({
          where: { letra_id: dto.id },
        }),
        this.prisma.letra_artist.deleteMany({
          where: { letra_id: dto.id },
        }),
      ]);

      await this.prisma.letra.delete({
        where: { id: dto.id },
      });

      // Delete all associated files
      await Promise.all(
        letraArtists
          .filter((la) => la.recording_url)
          .map((la) => this.storageService.deleteFile(la.recording_url)),
      );

      return {
        id: dto.id,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to delete Letra: ${error.message}`);
    }
  }

  async upsertArtist(
    dto: UpsertLetraArtistRequestDto,
  ): Promise<UpsertLetraArtistResponseDto> {
    try {
      const recording_file = Buffer.from(dto.recording_file, 'base64');
      const timestamp = new Date().getTime();
      const filename = `recording_${timestamp}.mp3`;

      const recording_url = await this.storageService.uploadFile(
        `letra_artist/${dto.letra_id}/${dto.artist_id}/${filename}`,
        recording_file,
      );

      const timestamp_date = new Date();
      await this.prisma.letra_artist.upsert({
        where: {
          letra_id_artist_id: {
            letra_id: dto.letra_id,
            artist_id: dto.artist_id,
          },
        },
        update: {
          recording_url: recording_url,
          updated_at: timestamp_date,
        },
        create: {
          name: `letra_${dto.letra_id}_artist_${dto.artist_id}`,
          recording_url: recording_url,
          created_at: timestamp_date,
          updated_at: timestamp_date,
          letra: {
            connect: { id: dto.letra_id },
          },
          artist: {
            connect: { id: dto.artist_id },
          },
          user_letra_artist_user_create_idTouser: {
            connect: { id: 1 },
          },
        },
      });

      return {
        letra_id: dto.letra_id,
        artist_id: dto.artist_id,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upsert Letra Artist: ${error.message}`,
      );
    }
  }
}
