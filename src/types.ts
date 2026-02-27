export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface Review {
  id: number;
  user_email: string;
  movie_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  user_email: string;
  movie_id: string;
  title: string;
  poster_path: string;
}
