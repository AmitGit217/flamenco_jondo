import {
  Controller,
  Body,
  Post,
  UseGuards,
  Delete,
  Param,
  Get,
} from '@nestjs/common';
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
export class PaloController {
  constructor(private readonly paloService: PaloService) {}

  @Post('upsert')
  @Roles('MASTER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async upsertPalo(
    @Body() dto: UpsertPaloRequestDto,
    @GetCurrentUser() user: user,
  ) {
    return this.paloService.upsertPalo(dto, user.id);
  }

  @Delete(':id')
  @Roles('MASTER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deletePalo(@Param('id') id: string) {
    return this.paloService.deletePalo(parseInt(id));
  }

  @Get(':id')
  async getPalo(@Param('id') id: string) {
    return this.paloService.getPalo(parseInt(id));
  }
}
