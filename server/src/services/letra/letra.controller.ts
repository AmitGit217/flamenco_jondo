import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  UseInterceptors,
  UploadedFile,
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
    return this.letraService.upsert(dto);
  }

  @Delete('delete')
  @Roles('MASTER')
  async delete(@Body() dto: DeleteLetraRequestDto) {
    return this.letraService.delete(dto);
  }

  @Post('upsert-artist')
  @Roles('MASTER')
  async upsertArtist(
    @Body() dto: UpsertLetraArtistRequestDto,
  ): Promise<UpsertLetraArtistResponseDto> {
    return this.letraService.upsertArtist(dto);
  }
}
