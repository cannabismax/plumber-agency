import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const SEARCH_API_KEY = process.env.EXA_API_KEY;

router.post("/search", async (req, res) => {
  const { query, city, state } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const location = city && state 
    ? `${city} ${state}`
    : city 
      ? city 
      : "";

  const fullQuery = location 
    ? `plumbing companies ${location} ${query}`
    : `plumbing services ${query}`;

  try {
    if (SEARCH_API_KEY) {
      const response = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SEARCH_API_KEY}`
        },
        body: JSON.stringify({
          query: fullQuery,
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

    const encodedQuery = encodeURIComponent(fullQuery);
    const searchUrl = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    const results = [];
    const seenUrls = new Set();

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics) {
        if (topic.Text && topic.FirstURL && !seenUrls.has(topic.FirstURL)) {
          seenUrls.add(topic.FirstURL);
          const title = topic.Text.split(/[-.]/)[0].trim() || topic.FirstURL;
          results.push({
            name: title.substring(0, 80),
            url: topic.FirstURL,
            snippet: topic.Text.substring(0, 150),
            city: city,
            state: state
          });
        }
        if (results.length >= 20) break;
      }
    }

    res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message, results: [] });
  }
});

export default router;
