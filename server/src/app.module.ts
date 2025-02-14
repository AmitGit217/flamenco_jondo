import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './services/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PaloModule } from './services/palo/palo.module';
import { EstiloModule } from './services/estilo/estilo.module';
import { ArtistModule } from './services/artist/artist.module';
import { CompasModule } from './services/compas/compas.module';
import { LetraModule } from './services/letra/letra.module';
import { StorageModule } from './services/storage/storage.module';
import { FeedbackModule } from './services/feedback/feedback.module';
import { StaticDataModule } from './services/static-data/static-data.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PaloModule,
    EstiloModule,
    ArtistModule,
    CompasModule,
    LetraModule,
    StorageModule,
    FeedbackModule,
    StaticDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
