import { Controller, Body, Post, UseGuards, Delete } from '@nestjs/common';
import { PaloService } from './palo.service';
import {
  DeletePaloRequestDto,
  UpsertPaloRequestDto,
} from '@common/dto/palo.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { GetCurrentUser } from '../utils/getCurretUser';
import { user } from '@prisma/client';
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

  @Delete('delete')
  @Roles('MASTER')
  async deletePalo(
    @Body() dto: DeletePaloRequestDto,
    @GetCurrentUser() user: user,
  ) {
    return this.paloService.deletePalo(dto, user.id);
  }
}
