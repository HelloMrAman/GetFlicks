import React from 'react';
import '../App.css'

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, original_language } }) => {
  return (
    <div className="movie-card">
      <div className="poster-wrapper relative">
        <img className=''
          src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
          alt={title}
        />
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="content flex items-center gap-2 text-sm text-gray-500">
          <div className="rating flex items-center gap-1">
            <img src="star.svg" alt="Star Icon" width={14} />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>
          <span>•</span>
          <p className="lang uppercase">{original_language}</p>
          <span>•</span>
          <p className="year">{release_date ? release_date.split('-')[0] : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
