import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Play, Plus, Info, Star, Bookmark, Tv, Film, Home, User, X, ChevronRight } from 'lucide-react';
import { tmdb, llaneraApi, gemini } from './services/api';
import { Movie, Review, WishlistItem } from './types';
import { LivePlayer } from './components/LivePlayer';
import { WelcomePage } from './components/WelcomePage';

const USER_EMAIL = "fidelalvaradot@gmail.com"; // From context

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'tv' | 'wishlist'>('home');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const trendingMovies = await tmdb.getTrending();
    setTrending(trendingMovies);
    const userWishlist = await llaneraApi.getWishlist(USER_EMAIL);
    setWishlist(userWishlist);

    if (userWishlist.length > 0) {
      const recs = await gemini.getRecommendations(userWishlist.map((i: any) => i.title));
      setRecommendations(recs);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await tmdb.search(searchQuery);
    setSearchResults(results);
  };

  const openMovieDetails = async (movie: Movie) => {
    const details = await tmdb.getDetails(movie.id.toString());
    setSelectedMovie(details);
  };

  const toggleWishlist = async (movie: Movie) => {
    const isInWishlist = wishlist.some(item => item.movie_id === movie.id.toString());
    if (isInWishlist) {
      await llaneraApi.removeFromWishlist(USER_EMAIL, movie.id);
    } else {
      await llaneraApi.addToWishlist(USER_EMAIL, movie);
    }
    const updated = await llaneraApi.getWishlist(USER_EMAIL);
    setWishlist(updated);
  };

  const MovieRow = ({ title, movies }: { title: string, movies: Movie[] }) => (
    <div className="mb-8 px-4 md:px-12">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-2">
        {title} <ChevronRight className="w-5 h-5 text-gray-400" />
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {movies.map(movie => (
          <motion.div
            key={movie.id}
            whileHover={{ scale: 1.05 }}
            className="flex-none w-32 md:w-48 cursor-pointer relative group"
            onClick={() => openMovieDetails(movie)}
          >
            <img
              src={tmdb.getImageUrl(movie.poster_path)}
              alt={movie.title}
              className="rounded-lg shadow-lg w-full aspect-[2/3] object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <Play className="w-12 h-12 fill-white" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-white selection:bg-brand selection:text-white">
      <AnimatePresence>
        {showWelcome && (
          <WelcomePage onFinish={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass px-4 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-brand tracking-tighter flex items-center gap-1">
            <Tv className="w-8 h-8" /> LLANERA TV+
          </h1>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
            <button onClick={() => setActiveTab('home')} className={`hover:text-white transition ${activeTab === 'home' ? 'text-white' : ''}`}>Inicio</button>
            <button onClick={() => setActiveTab('movies')} className={`hover:text-white transition ${activeTab === 'movies' ? 'text-white' : ''}`}>Películas</button>
            <button onClick={() => setActiveTab('tv')} className={`hover:text-white transition ${activeTab === 'tv' ? 'text-white' : ''}`}>TV en Vivo</button>
            <button onClick={() => setActiveTab('wishlist')} className={`hover:text-white transition ${activeTab === 'wishlist' ? 'text-white' : ''}`}>Mi Lista</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-white/10 border border-white/20 rounded-full py-1.5 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand w-32 md:w-64 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </form>
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-bold text-xs cursor-pointer">
            FA
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {activeTab === 'home' && !isSearching && (
          <>
            {/* Hero Section */}
            {trending.length > 0 && (
              <div className="relative h-[85vh] w-full overflow-hidden">
                <img
                  src={tmdb.getImageUrl(trending[0].backdrop_path, "original")}
                  alt={trending[0].title}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 hero-gradient" />
                <div className="absolute bottom-0 left-0 p-4 md:p-24 max-w-2xl">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-7xl font-bold mb-4 font-serif"
                  >
                    {trending[0].title}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-300 text-lg mb-8 line-clamp-3"
                  >
                    {trending[0].overview}
                  </motion.p>
                  <div className="flex gap-4">
                    <button className="bg-white text-black px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-gray-200 transition">
                      <Play className="w-5 h-5 fill-black" /> Reproducir
                    </button>
                    <button 
                      onClick={() => openMovieDetails(trending[0])}
                      className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-md font-bold flex items-center gap-2 transition backdrop-blur-md"
                    >
                      <Info className="w-5 h-5" /> Más Información
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="-mt-24 relative z-10">
              <MovieRow title="Tendencias de Hoy" movies={trending} />
              {recommendations.length > 0 && (
                <div className="mb-8 px-4 md:px-12">
                  <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-2">
                    Recomendado para ti <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {recommendations.map((title, idx) => (
                      <div key={idx} className="flex-none w-48 h-24 glass rounded-lg flex items-center justify-center p-4 text-center text-sm font-medium hover:bg-white/10 cursor-pointer">
                        {title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <MovieRow title="Aclamadas por la Crítica" movies={trending.slice().reverse()} />
            </div>
          </>
        )}

        {isSearching && (
          <div className="p-4 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Resultados para "{searchQuery}"</h2>
              <button onClick={() => setIsSearching(false)} className="text-gray-400 hover:text-white flex items-center gap-1">
                <X className="w-5 h-5" /> Cerrar
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {searchResults.map(movie => (
                <motion.div
                  key={movie.id}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                  onClick={() => openMovieDetails(movie)}
                >
                  <img
                    src={tmdb.getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="rounded-lg shadow-lg w-full aspect-[2/3] object-cover mb-2"
                    referrerPolicy="no-referrer"
                  />
                  <h3 className="text-sm font-medium truncate">{movie.title}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tv' && (
          <div className="p-4 md:p-12 max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Llanera TV en Vivo</h2>
              <p className="text-gray-400">Disfruta de nuestra programación en directo las 24 horas.</p>
            </div>
            
            <div className="aspect-video w-full mb-12">
              <LivePlayer 
                src="https://tvspectro.moxapps.shop/live/22OeaFNKyCOwDoFdVOOAwrPDJkx1/index.m3u8" 
                poster="https://picsum.photos/seed/llanera/1280/720"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-xl font-bold">Programación de Hoy</h3>
                <div className="space-y-4">
                  {[
                    { time: "18:00", title: "Noticiero Llanero", desc: "Las noticias más importantes de la región." },
                    { time: "19:30", title: "Cine Estelar", desc: "Grandes éxitos de la pantalla grande." },
                    { time: "21:30", title: "Deportes en Vivo", desc: "Resumen de la jornada deportiva." }
                  ].map((prog, i) => (
                    <div key={i} className="flex gap-4 p-4 glass rounded-xl hover:bg-white/5 transition">
                      <div className="text-brand font-bold whitespace-nowrap">{prog.time}</div>
                      <div>
                        <h4 className="font-medium">{prog.title}</h4>
                        <p className="text-sm text-gray-400">{prog.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Chat en Vivo</h3>
                <div className="glass rounded-xl h-80 flex flex-col">
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
                    <div className="flex gap-2"><span className="text-brand font-bold">Admin:</span> ¡Bienvenidos a Llanera TV!</div>
                    <div className="flex gap-2"><span className="text-gray-400 font-bold">User123:</span> Saludos desde el llano.</div>
                    <div className="flex gap-2"><span className="text-gray-400 font-bold">Maria:</span> Excelente señal.</div>
                  </div>
                  <div className="p-3 border-t border-white/10">
                    <input 
                      type="text" 
                      placeholder="Escribe un mensaje..." 
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="p-4 md:p-12">
            <h2 className="text-3xl font-bold mb-8">Mi Lista</h2>
            {wishlist.length === 0 ? (
              <div className="text-center py-24 text-gray-500">
                <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Tu lista está vacía. Añade películas para verlas más tarde.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {wishlist.map(item => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer relative group"
                    onClick={() => openMovieDetails({ id: parseInt(item.movie_id), title: item.title, poster_path: item.poster_path } as any)}
                  >
                    <img
                      src={tmdb.getImageUrl(item.poster_path)}
                      alt={item.title}
                      className="rounded-lg shadow-lg w-full aspect-[2/3] object-cover mb-2"
                      referrerPolicy="no-referrer"
                    />
                    <h3 className="text-sm font-medium truncate">{item.title}</h3>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Movie Details Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface w-full max-w-5xl max-h-full overflow-y-auto rounded-2xl relative shadow-2xl no-scrollbar"
            >
              <button 
                onClick={() => setSelectedMovie(null)}
                className="absolute top-6 right-6 z-10 bg-black/50 p-2 rounded-full hover:bg-black/80 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative h-64 md:h-96">
                <img
                  src={tmdb.getImageUrl(selectedMovie.backdrop_path, "original")}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h2 className="text-3xl md:text-5xl font-bold mb-2">{selectedMovie.title}</h2>
                  <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                    <span className="text-green-500">{Math.round(selectedMovie.vote_average * 10)}% Coincidencia</span>
                    <span>{selectedMovie.release_date?.split('-')[0]}</span>
                    <span className="border border-gray-500 px-1.5 rounded text-[10px]">HD</span>
                  </div>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="flex gap-4 mb-8">
                    <button className="bg-white text-black px-8 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-200 transition">
                      <Play className="w-5 h-5 fill-black" /> Reproducir
                    </button>
                    <button 
                      onClick={() => toggleWishlist(selectedMovie)}
                      className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center hover:bg-white/10 transition"
                    >
                      {wishlist.some(i => i.movie_id === selectedMovie.id.toString()) ? <Bookmark className="w-5 h-5 fill-white" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-lg text-gray-200 leading-relaxed mb-8">
                    {selectedMovie.overview}
                  </p>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Reparto</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {selectedMovie.credits?.cast?.slice(0, 10).map((person: any) => (
                        <div key={person.id} className="flex-none w-24 text-center">
                          <img 
                            src={tmdb.getImageUrl(person.profile_path, "w185")} 
                            className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-xs font-medium line-clamp-1">{person.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{person.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-gray-500 text-sm">Géneros: </span>
                    <span className="text-sm">{selectedMovie.genres?.map((g: any) => g.name).join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Director: </span>
                    <span className="text-sm">{selectedMovie.credits?.crew?.find((c: any) => c.job === 'Director')?.name}</span>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-xl">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" /> Reseñas de Usuarios
                    </h4>
                    <div className="space-y-4">
                      <div className="text-sm border-b border-white/10 pb-2">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Juan Perez</span>
                          <span className="text-yellow-500 text-xs">★★★★☆</span>
                        </div>
                        <p className="text-gray-400 text-xs">Increíble cinematografía y banda sonora.</p>
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Maria G.</span>
                          <span className="text-yellow-500 text-xs">★★★★★</span>
                        </div>
                        <p className="text-gray-400 text-xs">Una obra maestra del género.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/10 p-12 text-center text-gray-500 text-sm">
        <div className="flex justify-center gap-8 mb-8">
          <a href="#" className="hover:text-white transition">Términos de Uso</a>
          <a href="#" className="hover:text-white transition">Privacidad</a>
          <a href="#" className="hover:text-white transition">Centro de Ayuda</a>
        </div>
        <p>© 2026 Llanera TV+. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
