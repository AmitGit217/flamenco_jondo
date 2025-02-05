import { Module } from '@nestjs/common';
import { PaloController } from './palo.controller';
import { PaloService } from './palo.service';

@Module({
  controllers: [PaloController],
  providers: [PaloService]
})
export class PaloModule {}
