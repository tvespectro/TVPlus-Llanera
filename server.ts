import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("llanera.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    subscription_status TEXT DEFAULT 'free'
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    movie_id TEXT,
    title TEXT,
    poster_path TEXT,
    UNIQUE(user_email, movie_id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    movie_id TEXT,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Wishlist APIs
  app.get("/api/wishlist", (req, res) => {
    const email = req.query.email as string;
    const items = db.prepare("SELECT * FROM wishlist WHERE user_email = ?").all(email);
    res.json(items);
  });

  app.post("/api/wishlist", (req, res) => {
    const { email, movie_id, title, poster_path } = req.body;
    try {
      db.prepare("INSERT INTO wishlist (user_email, movie_id, title, poster_path) VALUES (?, ?, ?, ?)")
        .run(email, movie_id.toString(), title, poster_path);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Already in wishlist" });
    }
  });

  app.delete("/api/wishlist", (req, res) => {
    const { email, movie_id } = req.body;
    db.prepare("DELETE FROM wishlist WHERE user_email = ? AND movie_id = ?").run(email, movie_id.toString());
    res.json({ success: true });
  });

  // Reviews APIs
  app.get("/api/reviews/:movieId", (req, res) => {
    const reviews = db.prepare("SELECT * FROM reviews WHERE movie_id = ? ORDER BY created_at DESC").all(req.params.movieId);
    res.json(reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { email, movie_id, rating, comment } = req.body;
    db.prepare("INSERT INTO reviews (user_email, movie_id, rating, comment) VALUES (?, ?, ?, ?)")
      .run(email, movie_id.toString(), rating, comment);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
