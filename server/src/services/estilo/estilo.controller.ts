import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EstiloService } from './estilo.service';
import { UpsertEstiloRequestDto } from '@common/dto/estilo.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles, RolesGuard } from '../../gurads/role.guard';

@Controller('estilo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstiloController {
  constructor(private readonly estiloService: EstiloService) {}

  @Post()
  @Roles('MASTER')
  async upsert(@Body() dto: UpsertEstiloRequestDto) {
    return this.estiloService.upsert(dto);
  }
}
