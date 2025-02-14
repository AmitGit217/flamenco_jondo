import { Controller, Get, Query } from '@nestjs/common';
import { StaticDataService } from './static-data.service';

@Controller('static-data')
export class StaticDataController {
  constructor(private readonly staticDataService: StaticDataService) {}

  @Get('tableByType')
  getTableByType(
    @Query('type')
    type: 'palo' | 'estilo' | 'artist' | 'compas' | 'letra' | 'letra_artist',
  ) {
    return this.staticDataService.getTableByType(type);
  }
}
