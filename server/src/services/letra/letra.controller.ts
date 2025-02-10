import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { LetraService } from './letra.service';
import {
  UpsertLetraRequestDto,
  UpsrtLetraResponseDto,
} from '@common/dto/letra.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles, RolesGuard } from '../../gurads/role.guard';

@Controller('letra')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LetraController {
  constructor(private readonly letraService: LetraService) {}

  @Post('upsert')
  @Roles('MASTER')
  async upsert(
    @Body() dto: UpsertLetraRequestDto,
  ): Promise<UpsrtLetraResponseDto> {
    return this.letraService.upsert(dto);
  }
}
