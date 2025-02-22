import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { LetraService } from './letra.service';
import {
  UpsertLetraRequestDto,
  UpsrtLetraResponseDto,
  DeleteLetraRequestDto,
  UpsertLetraArtistRequestDto,
  UpsertLetraArtistResponseDto,
} from '@common/dto/letra.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles, RolesGuard } from '../../gurads/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('letra')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LetraController {
  constructor(private readonly letraService: LetraService) {}

  @Post('upsert')
  @Roles('MASTER')
  async upsert(
    @Body() dto: UpsertLetraRequestDto,
  ): Promise<UpsrtLetraResponseDto> {
    return this.letraService.upsertLetraWithArtist(dto);
  }

  @Delete(':id')
  @Roles('MASTER')
  async delete(@Param('id') id: string) {
    return this.letraService.delete(parseInt(id));
  }
}
