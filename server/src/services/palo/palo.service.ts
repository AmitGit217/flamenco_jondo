import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertPaloRequestDto } from '@common/dto/palo.dto';

@Injectable()
export class PaloService {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertPalo(dto: UpsertPaloRequestDto, userId: number) {
    const upsertData = {
      name: dto.name,
      origin: dto.origin,
      origin_date: new Date(dto.origin_date),
      updated_at: new Date(),
      user_update_id: userId,
    };

    if (!dto.id) {
      // Create new palo
      return await this.prismaService.palo.create({
        data: {
          ...upsertData,
          created_at: new Date(),
          user_create_id: userId,
        },
      });
    }

    // Update existing palo
    return await this.prismaService.palo.upsert({
      where: { id: dto.id },
      update: upsertData,
      create: {
        ...upsertData,
        created_at: new Date(),
        user_create_id: userId,
      },
    });
  }
}
