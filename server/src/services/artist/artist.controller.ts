import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { UpsertArtistRequestDto } from '@common/dto/artist.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles, RolesGuard } from '../../gurads/role.guard';

@Controller('artist')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArtistController {
  constructor(private readonly ArtistaService: ArtistService) {}

  @Post('upsert')
  @Roles('MASTER')
  async upsert(@Body() dto: UpsertArtistRequestDto) {
    return this.ArtistaService.upsert(dto);
  }
}
