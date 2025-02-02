import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserRequestDto, CreateUserResponseDto } from '@common/dto/signup.dto';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/login.dto';
import { GetCurrentUser } from '../utils/decorators/getCurrentUser.decorator';
import { JwtAuthGuard } from '../utils/jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserRequestDto: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    try {
      return await this.authService.signup(createUserRequestDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      return await this.authService.login(loginRequestDto);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@GetCurrentUser() user: CreateUserResponseDto) {
    return user;
  }
}
