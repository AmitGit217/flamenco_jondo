import { Controller, Get, Query } from '@nestjs/common';
import { StaticDataService } from './static-data.service';

@Controller('static-data')
export class StaticDataController {
  constructor(private readonly staticDataService: StaticDataService) {}

  @Get('tableByType')
  getTableByType(
    @Query('type')
    type: 'palo' | 'estilo' | 'artist' | 'compas' | 'letra' | 'letra_artist',
    @Query('query') query?: string, // Optional search query
  ) {
    return this.staticDataService.getTableByType(type, query);
  }

  @Get('universalSearch')
  universalSearch(@Query('query') query: string) {
    return this.staticDataService.universalSearch(query);
  }
}
