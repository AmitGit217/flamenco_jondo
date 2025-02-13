import { Module } from '@nestjs/common';
import { LetraController } from './letra.controller';
import { LetraService } from './letra.service';
import { StorageService } from '../storage/storage.service';
@Module({
  controllers: [LetraController],
  providers: [LetraService, StorageService],
})
export class LetraModule {}
