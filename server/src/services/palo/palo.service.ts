import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpsertPaloRequestDto,
  UpsertPaloResponseDto,
} from '@common/dto/palo.dto';

@Injectable()
export class PaloService {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertPalo(
    dto: UpsertPaloRequestDto,
    userId: number,
  ): Promise<UpsertPaloResponseDto> {
    const timestamp = new Date();
    if (!dto.id) {
      const createdPalo = await this.prismaService.palo.create({
        data: {
          name: dto.name,
          origin: dto.origin,
          origin_date: new Date(dto.origin_date).toISOString(),
          created_at: timestamp,
          updated_at: timestamp,
          user_create_id: userId,
          user_update_id: userId,
        },
      });
    return {
      ...createdPalo,
      origin_date: createdPalo.origin_date.toISOString(),
      created_at: createdPalo.created_at?.toISOString() || null,
      updated_at: createdPalo.updated_at?.toISOString() || null,
    };
    }
    const updatedPalo = await this.prismaService.palo.update({
      where: { id: dto.id },
      data: {
        name: dto.name,
        origin: dto.origin,
        origin_date: new Date(dto.origin_date).toISOString(),
        updated_at: timestamp,
        user_update_id: userId,
      },
    });
    return {
      ...updatedPalo,
      origin_date: updatedPalo.origin_date.toISOString(),
      created_at: updatedPalo.created_at?.toISOString() || null,
      updated_at: updatedPalo.updated_at?.toISOString() || null,
    };
  }
}
