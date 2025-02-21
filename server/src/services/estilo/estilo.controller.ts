import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { EstiloService } from './estilo.service';
import {
  DeleteEstiloRequestDto,
  UpsertEstiloRequestDto,
} from '@common/dto/estilo.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles, RolesGuard } from '../../gurads/role.guard';

@Controller('estilo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstiloController {
  constructor(private readonly estiloService: EstiloService) {}

  @Post('upsert')
  @Roles('MASTER')
  async upsert(@Body() dto: UpsertEstiloRequestDto) {
    return this.estiloService.upsert(dto);
  }

  @Delete(':id')
  @Roles('MASTER')
  async delete(@Param('id') id: string) {
    return this.estiloService.delete(parseInt(id));
  }
}
