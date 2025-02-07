import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './services/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PaloModule } from './services/palo/palo.module';
import { EstiloModule } from './services/estilo/estilo.module';

@Module({
  imports: [PrismaModule, AuthModule, PaloModule, EstiloModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
