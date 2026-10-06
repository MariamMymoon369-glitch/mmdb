import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  Headers,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/CreateMovie.dto';
import { GetMoviesDto } from './dto/get-movies.dto';
import { RateMovieDto } from './dto/rate-movie.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

interface AuthenticatedRequestUser {
  userId: number;
  email: string;
  uuid: string;
  jti?: string;
}

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  getMovies(@Query() query: GetMoviesDto) {
    return this.moviesService.findAll(query);
  }

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get(':uuid')
  getMovie(
    @Param('uuid') uuid: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.moviesService.findByUuid(uuid, authorization);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':uuid/rating')
  async rate(
    @Param('uuid') uuid: string,
    @Body() rateMovieDto: RateMovieDto,
    @Request() req: ExpressRequest & { user: AuthenticatedRequestUser },
  ) {
    return await this.moviesService.rate(uuid, req.user.userId, rateMovieDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':uuid/rating')
  async getMyRating(
    @Param('uuid') uuid: string,
    @Request() req: ExpressRequest & { user: AuthenticatedRequestUser },
  ) {
    return await this.moviesService.getMyRating(uuid, req.user.userId);
  }
}
