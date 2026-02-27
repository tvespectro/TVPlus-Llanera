import { GoogleGenAI } from "@google/genai";
import { Movie } from "../types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.VITE_TMDB_API_KEY || "";

export const tmdb = {
  getTrending: async (): Promise<Movie[]> => {
    if (!API_KEY) return [];
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results;
  },
  search: async (query: string): Promise<Movie[]> => {
    if (!API_KEY) return [];
    const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.results;
  },
  getDetails: async (id: string): Promise<any> => {
    if (!API_KEY) return null;
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos,credits,recommendations`);
    return await res.json();
  },
  getImageUrl: (path: string, size: string = "w500") => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : "https://via.placeholder.com/500x750?text=No+Image";
  }
};

export const llaneraApi = {
  getWishlist: async (email: string) => {
    const res = await fetch(`/api/wishlist?email=${encodeURIComponent(email)}`);
    return await res.json();
  },
  addToWishlist: async (email: string, movie: Movie) => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path
      })
    });
    return await res.json();
  },
  removeFromWishlist: async (email: string, movieId: number) => {
    const res = await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, movie_id: movieId })
    });
    return await res.json();
  },
  getReviews: async (movieId: string) => {
    const res = await fetch(`/api/reviews/${movieId}`);
    return await res.json();
  },
  addReview: async (email: string, movieId: string, rating: number, comment: string) => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, movie_id: movieId, rating, comment })
    });
    return await res.json();
  }
};

export const gemini = {
  getRecommendations: async (history: string[]) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these movies I liked: ${history.join(", ")}, recommend 5 similar movies. Return ONLY a JSON array of strings (movie titles).`,
      config: { responseMimeType: "application/json" }
    });
    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return [];
    }
  }
};
