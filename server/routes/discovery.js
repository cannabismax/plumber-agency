import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const SEARCH_API_KEY = process.env.EXA_API_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY;

router.post("/search", async (req, res) => {
  const { query, city, state } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const location = city && state ? `${city}, ${state}` : city || "";

  const searchQuery = location 
    ? `plumbing ${query} in ${location}`
    : `plumbing ${query}`;

  try {
    if (SEARCH_API_KEY) {
      const response = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SEARCH_API_KEY}`
        },
        body: JSON.stringify({
          query: searchQuery,
          numResults: 20,
          type: "keyword",
          category: "company_homepages"
        })
      });

      if (response.ok) {
        const data = await response.json();
        const results = (data.results || []).map(r => ({
          name: r.title,
          url: r.url,
          snippet: r.snippet,
          city: city,
          state: state
        }));
        return res.json({ results });
      }
    }

    if (SERPAPI_KEY) {
      const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&api_key=${SERPAPI_KEY}`);
      const data = await response.json();
      
      if (data.organic_results) {
        const results = data.organic_results.slice(0, 20).map(r => ({
          name: r.title,
          url: r.link,
          snippet: r.snippet || "",
          city: city,
          state: state
        }));
        return res.json({ results });
      }
    }

    res.json({ 
      results: [],
      message: "Web search requires EXA_API_KEY or SERPAPI_KEY. Add one to .env to enable discovery."
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message, results: [] });
  }
});

export default router;
