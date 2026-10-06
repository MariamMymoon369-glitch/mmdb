import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

interface AuthenticatedRequestUser {
  userId: number;
  email: string;
  uuid: string;
  jti?: string;
}

@Controller('movies/:movieUuid/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getReviews(
    @Param('movieUuid') movieUuid: string,
    @Query() query: GetReviewsDto,
  ) {
    return this.reviewsService.findAllForMovie(movieUuid, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('movieUuid') movieUuid: string,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req: ExpressRequest & { user: AuthenticatedRequestUser },
  ) {
    return await this.reviewsService.create(
      movieUuid,
      req.user.userId,
      createReviewDto,
    );
  }
}
