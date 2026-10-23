import { requireUser } from "./server/requireUser.js";
import { publicBanner } from "./server/admin.js";
import { adminCheck, adminData, adminOp, adminSaveConfig, adminWhoami } from "./server/admin.js";
import { funnelEvent } from "./server/events.js";
import { googleClientId, signIn, visit } from "./server/users.js";
import { aiRateLimit, checkBody, checkOrigin, clientIp } from "./server/guard.js";
import express from "express";
import feedbackHandler from "./api/feedback.js";
import commentsHandler from "./api/comments.js";
import path from "path";
import { createServer as createViteServer } from "vite";
import { verifyGoogleIdToken } from "./server/googleAuth.js";
import { rateLimit, searchJobs } from "./server/jobsSearch.js";
import { handleAction, keyFromHeaders, serverKeyConfigured, ApiError } from "./server/handlers.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/status", async (_req, res) => res.json({ serverKey: serverKeyConfigured(), googleClientId: googleClientId() || null, banner: await publicBanner() }));
  app.post("/api/auth/google", async (req, res) => {
    try {
      checkOrigin(req.headers);
      res.json(await signIn(req.body, String(req.headers["user-agent"] || "")));
    } catch (e: any) {
      res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code });
    }
  });
  app.post("/api/auth/event", async (req, res) => {
    try { checkOrigin(req.headers); res.json(await funnelEvent(req.body, clientIp(req.headers, req.socket?.remoteAddress))); }
    catch (e: any) { res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code }); }
  });
  app.all("/api/admin/:action", async (req, res) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow"); res.setHeader("Cache-Control", "no-store");
    try {
      checkOrigin(req.headers);
      const a = req.params.action;
      if (a === "check" && req.method === "POST") return res.json(await adminCheck(req.body));
      if (a === "op" && req.method === "POST") return res.json(await adminOp(req.headers.authorization, req.body));
      if (a === "whoami" && req.method === "GET") return res.json(await adminWhoami(req.headers.authorization));
      if (a === "data" && req.method === "GET") return res.json(await adminData(req.headers.authorization));
      if (a === "config" && req.method === "POST") return res.json(await adminSaveConfig(req.headers.authorization, req.body));
      throw new ApiError(404, "Not found", "NOT_FOUND");
    } catch (e: any) { res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code }); }
  });
  app.post("/api/auth/visit", async (req, res) => {
    try { checkOrigin(req.headers); res.json(await visit(req.body, clientIp(req.headers, req.socket?.remoteAddress))); }
    catch (e: any) { res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code }); }
  });
  app.all("/api/feedback", (req, res) => feedbackHandler(req, res));
  app.all("/api/comments", (req, res) => commentsHandler(req, res));
  app.post("/api/jobs/search", async (req, res) => {
    try {
      checkOrigin(req.headers); await requireUser(req.headers); checkBody(req.body);
      rateLimit(String(req.headers["x-forwarded-for"] || req.ip || "anon").split(",")[0].trim());
      res.json({ result: await searchJobs(req.body || {}) });
    } catch (e: any) {
      res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code });
    }
  });
  app.post("/api/ai/:action", async (req, res) => {
    try {
      checkOrigin(req.headers); await requireUser(req.headers); checkBody(req.body); aiRateLimit(clientIp(req.headers, req.ip));
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
    app.use(express.static(distPath, { dotfiles: "allow" }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
