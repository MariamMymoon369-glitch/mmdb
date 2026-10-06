export interface ReviewResponseDto {
  uuid: string;
  title: string | null;
  body: string | null;
  rating: number | null;
  createdAt: Date;
  userUuid: string;
  reviewer: {
    displayName: string;
    profilePictureUrl: string | null;
  };
}

export class PaginatedReviewsResponseDto {
  data: ReviewResponseDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
