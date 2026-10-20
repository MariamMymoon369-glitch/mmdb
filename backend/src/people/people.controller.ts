import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get(':uuid')
  getPerson(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.peopleService.findDetails(uuid);
  }
}
