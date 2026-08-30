import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  scoreJobDescription, 
  tailorResumeForJob, 
  generateCoverLetter, 
  generateOutreachMessage 
} from "./server/gemini.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", system: "Akash Sharma Job Acquisition OS v2.0", ctcFloor: "18 LPA" });
  });

  app.post("/api/score-job", async (req, res) => {
    try {
      const { title, company, description, location, workMode, shift, ctcMinLpa, ctcMaxLpa, source } = req.body;
      if (!description || !title) {
        return res.status(400).json({ error: "Title and Job Description are required." });
      }
      const scoreResult = await scoreJobDescription({
        title,
        company: company || "Target Enterprise",
        description,
        location,
        workMode,
        shift,
        ctcMinLpa: ctcMinLpa ? Number(ctcMinLpa) : undefined,
        ctcMaxLpa: ctcMaxLpa ? Number(ctcMaxLpa) : undefined,
        source
      });
      res.json({ success: true, scoreResult });
    } catch (error: any) {
      console.error("Error scoring job:", error);
      res.status(500).json({ error: error.message || "Failed to score job description." });
    }
  });

  app.post("/api/tailor-resume", async (req, res) => {
    try {
      const { title, company, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: "Title and Description required." });
      }
      const result = await tailorResumeForJob({ title, company: company || "Target Company", description });
      res.json({ success: true, tailoredResume: result });
    } catch (error: any) {
      console.error("Error tailoring resume:", error);
      res.status(500).json({ error: error.message || "Failed to tailor resume." });
    }
  });

  app.post("/api/generate-cover-letter", async (req, res) => {
    try {
      const { title, company, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: "Title and Description required." });
      }
      const result = await generateCoverLetter({ title, company: company || "Target Company", description });
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("Error generating cover letter:", error);
      res.status(500).json({ error: error.message || "Failed to generate cover letter." });
    }
  });

  app.post("/api/generate-outreach", async (req, res) => {
    try {
      const { title, company, description, contactName, contactTitle } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: "Title and Description required." });
      }
      const result = await generateOutreachMessage({ 
        title, 
        company: company || "Target Company", 
        description, 
        contactName, 
        contactTitle 
      });
      res.json({ success: true, outreach: result });
    } catch (error: any) {
      console.error("Error generating outreach message:", error);
      res.status(500).json({ error: error.message || "Failed to generate outreach message." });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
