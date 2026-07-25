import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Healthcheck endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Jaysmoneyguides", timestamp: new Date().toISOString() });
  });

  // Google AdSense ads.txt endpoint
  app.get("/ads.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.send("google.com, pub-6197929752414076, DIRECT, f08c47fec0942fa0\n");
  });

  // AI Content Assistant API for Admin Console
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, type } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in environment variables."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let systemInstruction = "You are an expert affiliate marketer, SEO strategist, and blogger named Jay Lopez for Jaysmoneyguides. Write actionable, highly converting, well-structured content for entrepreneurs.";

      if (type === "outline") {
        systemInstruction += " Format output as a blog post outline with catch headings, key takeaways, and suggested affiliate product placement.";
      } else if (type === "title") {
        systemInstruction += " Generate 5 high-CTR, SEO-optimized headlines for the blog post topic.";
      } else if (type === "excerpt") {
        systemInstruction += " Write a compelling 2-sentence meta description / excerpt for this post that maximizes search click-through rate.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const generatedText = response.text || "No content generated.";
      res.json({ text: generatedText });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI content" });
    }
  });

  // Contact Form Endpoint
  app.post("/api/contact", (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }
    
    // Process contact submission
    console.log(`[Contact Form Received] From: ${name} (${email}), Subject: ${subject}`);
    res.json({
      success: true,
      message: "Thank you for reaching out! Jay will respond to your message within 24 hours."
    });
  });

  // Newsletter Subscriber Endpoint
  app.post("/api/subscribers", (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    console.log(`[Newsletter Subscriber Added]: ${email}`);
    res.json({
      success: true,
      message: "Welcome to the Jaysmoneyguides VIP newsletter! Check your inbox for your free starter guide."
    });
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Jaysmoneyguides server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
