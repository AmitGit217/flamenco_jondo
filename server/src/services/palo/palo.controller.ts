import { Controller, Body, Post, UseGuards, Req } from '@nestjs/common';
import { PaloService } from './palo.service';
import { UpsertPaloRequestDto } from '@common/dto/palo.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { GetCurrentUser } from '../utils/getCurretUser';
import { user } from '@common/index';
import { Roles, RolesGuard } from '../../gurads/role.guard';

@Controller('palo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaloController {
  constructor(private readonly paloService: PaloService) {}

  @Post('upsert')
  @Roles('MASTER')
  async upsertPalo(
    @Body() dto: UpsertPaloRequestDto,
    @GetCurrentUser() user: user,
  ) {
    return this.paloService.upsertPalo(dto, user.id);
  }
}
