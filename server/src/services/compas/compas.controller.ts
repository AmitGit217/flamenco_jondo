import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { CompasService } from './compas.service';
import {
  UpsertCompasRequestDto,
  UpsertCompasResponseDto,
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
  ): Promise<UpsertCompasResponseDto> {
    return this.compasService.upsert(dto);
  }

  @Delete(':id')
  @Roles('MASTER')
  async delete(@Param('id') id: string) {
    return this.compasService.delete(parseInt(id));
  }
}
