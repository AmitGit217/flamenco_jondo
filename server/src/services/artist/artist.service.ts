import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertArtistRequestDto } from '@common/dto/artist.dto';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertArtistRequestDto) {}
}
