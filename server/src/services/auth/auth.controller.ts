import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/login.dto';
import { GetCurrentUser } from '../utils/getCurretUser';
import { user } from '@prisma/client';
import { JwtAuthGuard } from './jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginRequestDto: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    try {
      return await this.authService.login(loginRequestDto);
    } catch (error) {
      throw error;
    }
  }

  @Get('validate-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validateToken(@GetCurrentUser() user: user) {
    return user;
  }
}
