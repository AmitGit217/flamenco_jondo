import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertPaloRequestDto } from '@common/dto/palo.dto';

@Injectable()
export class PaloService {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertPalo(dto: UpsertPaloRequestDto, userId: number) {
    const timestamp = new Date();
    if (!dto.id) {
      return this.prismaService.palo.create({
        data: {
          name: dto.name,
          origin: dto.origin,
          origin_date: new Date(dto.origin_date),
          created_at: timestamp,
          updated_at: timestamp,
          user_create_id: userId,
          user_update_id: userId,
        },
      });
    }
    return this.prismaService.palo.update({
      where: { id: dto.id },
      data: {
        name: dto.name,
        origin: dto.origin,
        origin_date: new Date(dto.origin_date),
        updated_at: timestamp,
        user_update_id: userId,
      },
    });
  }
}
