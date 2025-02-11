import { Controller, Post, Body, UseGuards, Delete } from '@nestjs/common';
import { CompasService } from './compas.service';
import {
  UpsertCompasRequestDto,
  UpsertCompasResponseDto,
  DeleteCompasRequestDto,
  DeleteCompasResponseDto,
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

  @Delete('delete')
  @Roles('MASTER')
  async delete(@Body() dto: DeleteCompasRequestDto) {
    return this.compasService.delete(dto);
  }
}
