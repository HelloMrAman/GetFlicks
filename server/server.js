import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors());

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.VITE_TMDB_API_KEY;
const proxyUrl = 'http://159.69.57.20:8880';
const agent = new HttpsProxyAgent(proxyUrl);

const API_OPTIONS = {
  method: 'GET',
  headers: { accept: 'application/json' },
  agent,
};

app.get("/api/movies", async (req, res) => {
  const query = req.query.query;
  const url = query
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`
    : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;

  try {
    const response = await fetch(url, API_OPTIONS);
    const data = await response.json();

    if (!response.ok) {
      throw new Error("TMDB API error");
    }

    res.json(data);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch data from TMDB" });
  }
});

// fallback recommendation endpoint (e.g., for fuzzy search)
app.get("/api/movies/recommendations", async (req, res) => {
  const query = req.query.query;
  const url = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query.split(" ")[0])}&api_key=${API_KEY}`;

  try {
    const response = await fetch(url, API_OPTIONS);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Fallback search error:", err);
    res.status(500).json({ error: "Failed to fetch recommendation data" });
  }
});

app.get("/api/movies/:id/videos", async (req, res) => {
  const movieId = req.params.id;
  const url = `${API_BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`;

  try {
    const response = await fetch(url, API_OPTIONS);
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch trailer");
    }

    res.json(data);
  } catch (err) {
    console.error("Trailer Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch trailer data" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
