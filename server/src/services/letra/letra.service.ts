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

  async upsertLetraWithArtist(
    dto: UpsertLetraRequestDto,
  ): Promise<UpsrtLetraResponseDto> {
    try {
      const timestamp = new Date();

      // Step 1: Upsert Letra (Main record)
      const letra = await this.prisma.letra.upsert({
        where: { id: dto.id || -1 },
        update: {
          verses: dto.verses,
          comment: dto.comment,
          updated_at: timestamp,
          estilo: { connect: { id: dto.estilo_id || -1 } },
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
          comment: dto.comment,
          created_at: timestamp,
          updated_at: timestamp,
          estilo: { connect: { id: dto.estilo_id || -1 } },
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

      let recording_url: string | null = null;

      // Step 2: Handle Optional Artist & Recording (if provided)
      if (dto.artist_id && dto.recording) {
        const recording_file = Buffer.from(dto.recording, 'base64');
        const timestampStr = new Date().getTime();
        const filename = `recording_${timestampStr}.mp3`;

        recording_url = await this.storageService.uploadFile(
          `letra_artist/${letra.id}/${dto.artist_id}/${filename}`,
          recording_file,
        );

        // Upsert Artist with Recording
        await this.prisma.letra_artist.upsert({
          where: {
            letra_id_artist_id: {
              letra_id: letra.id,
              artist_id: dto.artist_id,
            },
          },
          update: { recording_url, updated_at: timestamp },
          create: {
            name: `letra_${letra.id}_artist_${dto.artist_id}`,
            recording_url,
            created_at: timestamp,
            updated_at: timestamp,
            letra: { connect: { id: letra.id } },
            artist: { connect: { id: dto.artist_id } },
            user_letra_artist_user_create_idTouser: { connect: { id: 1 } },
          },
        });
      }

      const letraArtists = await this.prisma.letra_artist.findMany({
        where: { letra_id: letra.id },
        select: { artist_id: true },
      });

      const palo_estilo = await this.prisma.palo_estilo.findFirst({
        where: { estilo_id: dto.estilo_id },
      });

      return {
        id: letra.id,
        estilo_id: dto.estilo_id,
        artist_id: letraArtists.length > 0 ? letraArtists[0].artist_id : null,
        palo_id: palo_estilo ? palo_estilo.palo_id : null,
        verses: letra.verses,
        recording: recording_url,
        comment: letra.comment,
        created_at: letra.created_at?.toISOString() || null,
        updated_at: letra.updated_at?.toISOString() || null,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upsert Letra: ${error.message}`);
    }
  }

  async delete(id: number): Promise<DeleteLetraResponseDto> {
    try {
      // Get all recording URLs before deletion
      const letraArtists = await this.prisma.letra_artist.findMany({
        where: { letra_id: id },
        select: { recording_url: true },
      });

      // Delete all database records

      await this.prisma.letra_artist.deleteMany({
        where: { letra_id: id },
      });

      await this.prisma.letra.delete({
        where: { id: id },
      });

      // Delete all associated files
      await Promise.all(
        letraArtists
          .filter((la) => la.recording_url)
          .map((la) => this.storageService.deleteFile(la.recording_url)),
      );

      return {
        id: id,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to delete Letra: ${error.message}`);
    }
  }
}
