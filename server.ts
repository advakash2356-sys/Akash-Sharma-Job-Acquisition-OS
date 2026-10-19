import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { verifyGoogleIdToken } from "./server/googleAuth.js";
import { handleAction, keyFromHeaders, serverKeyConfigured, ApiError } from "./server/handlers.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/status", (_req, res) => res.json({ serverKey: serverKeyConfigured() }));
  app.post("/api/auth/google", async (req, res) => {
    try {
      res.json(await verifyGoogleIdToken(req.body?.credential));
    } catch (e: any) {
      res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code });
    }
  });
  app.post("/api/ai/:action", async (req, res) => {
    try {
      res.json(await handleAction(req.params.action, req.body || {}, keyFromHeaders(req.headers)));
    } catch (e: any) {
      res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code });
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
