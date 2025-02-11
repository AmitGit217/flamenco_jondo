import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeletePaloResponseDto } from '../../../../common/dto/palo.dto';
import {
  UpsertPaloRequestDto,
  UpsertPaloResponseDto,
  DeletePaloRequestDto,
} from '@common/dto/palo.dto';

@Injectable()
export class PaloService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async deletePalo(
    dto: DeletePaloRequestDto,
    userId: number,
  ): Promise<DeletePaloResponseDto> {
    try {
      await this.prismaService.palo.delete({
        where: { id: dto.id },
      });

      return {
        id: dto.id,
      };
    } catch (error) {
      throw new Error(`Failed to delete Palo: ${error.message}`);
    }
  }
}
