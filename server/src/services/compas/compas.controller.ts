import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CompasService } from './compas.service';
import {
  UpsertCompasRequestDto,
  CompasResponseDto,
} from '@common/dto/compas.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles, RolesGuard } from '../../gurads/role.guard';

@Controller('compas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompasController {
  constructor(private readonly compasService: CompasService) {}

  @Post('upsert')
  @Roles('MASTER')
  async upsert(
    @Body() dto: UpsertCompasRequestDto,
  ): Promise<CompasResponseDto> {
    return this.compasService.upsert(dto);
  }
}
