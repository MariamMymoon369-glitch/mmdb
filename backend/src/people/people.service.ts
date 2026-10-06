import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async findByUuid(uuid: string): Promise<Person> {
    const person = await this.personRepository.findOne({ where: { uuid } });
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    return person;
  }
}
