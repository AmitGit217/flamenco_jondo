import { Module } from '@nestjs/common';
import { LetraController } from './letra.controller';
import { LetraService } from './letra.service';

@Module({
  controllers: [LetraController],
  providers: [LetraService]
})
export class LetraModule {}
