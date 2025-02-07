import { Module } from '@nestjs/common';
import { EstiloController } from './estilo.controller';
import { EstiloService } from './estilo.service';

@Module({
  controllers: [EstiloController],
  providers: [EstiloService],
})
export class EstiloModule {}
