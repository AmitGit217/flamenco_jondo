import { Module } from '@nestjs/common';
import { CompasController } from './compas.controller';
import { CompasService } from './compas.service';

@Module({
  controllers: [CompasController],
  providers: [CompasService],
})
export class CompasModule {}
