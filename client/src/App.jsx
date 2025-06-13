import { useEffect, useState } from "react";
import Search from './components/Search';
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from "./appwrite";

// 👇 dynamic base URL inline
const getBaseUrl = () => {
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://getflicks.onrender.com'; 
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [trailerKey, setTrailerKey] = useState(null);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    setMovieList([]);

    try {
      const baseUrl = getBaseUrl();
      const endpoint = query
        ? `${baseUrl}/api/movies?query=${encodeURIComponent(query)}`
        : `${baseUrl}/api/movies`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch movies");
      }

      if (query && (!data.results || data.results.length === 0)) {
        setErrorMessage(`"${query}" movie is not available or try to spell correct.`);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  const fetchTrailer = async (movieId) => {
    try {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/api/movies/${movieId}/videos`);
      const data = await res.json();

      const trailer = data.results.find(
        (vid) => (vid.type === 'Trailer' || vid.type === 'Teaser') && vid.site === 'YouTube'
      );

      if (trailer) {
        setTrailerKey(trailer.key);
      } else {
        alert('Trailer not available');
      }
    } catch (error) {
      console.error("Trailer fetch failed:", error);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <div className="pattern">
      <div className="wrapper">
        <header>
          <img src="hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul className="movie-grid">
              {movieList.map((movie) => (
                <li
                  key={movie.id}
                  onClick={() => fetchTrailer(movie.id)}
                  className="cursor-pointer relative overflow-hidden transition transform hover:scale-105 active:scale-95 duration-200"
                >
                  <span className="absolute inset-0 bg-white opacity-0 active:opacity-10 transition duration-200 pointer-events-none" />
                  <MovieCard movie={movie} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {trailerKey && (
          <div className="modal">
            <div className="modal-content">
              <span onClick={() => setTrailerKey(null)} className="close">&times;</span>
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
