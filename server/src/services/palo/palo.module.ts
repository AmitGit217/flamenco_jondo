import { Module } from '@nestjs/common';
import { PaloController } from './palo.controller';
import { PaloService } from './palo.service';
import { StorageService } from '../storage/storage.service';

@Module({
  controllers: [PaloController],
  providers: [PaloService, StorageService],
})
export class PaloModule {}
