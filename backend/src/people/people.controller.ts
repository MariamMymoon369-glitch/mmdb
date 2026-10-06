import { Controller, Get, Param } from '@nestjs/common';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get(':uuid')
  getPerson(@Param('uuid') uuid: string) {
    return this.peopleService.findByUuid(uuid);
  }
}
