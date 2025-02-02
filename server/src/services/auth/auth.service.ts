import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = loginRequestDto;

    this.logger.log(`Login attempt for email: ${email}`);

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn(`Login failed: User with email ${email} not found`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for email ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email });
    this.logger.log(`Login successful for user ID: ${user.id}`);

    return { token };
  }

  async validateUser(id: number, email: string) {
    this.logger.log(`Validating user with ID: ${id} and email: ${email}`);

    const user = await this.prismaService.user.findUnique({
      where: { id, email },
    });

    if (!user) {
      this.logger.warn(`Validation failed: Invalid token for user ID: ${id}`);
      throw new UnauthorizedException('Invalid token');
    }

    this.logger.log(`User validation successful for user ID: ${user.id}`);

    return user;
  }
}
