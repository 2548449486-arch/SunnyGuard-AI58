import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { ClerkExpressWithAuth, LooseAuthProp } from "@clerk/clerk-sdk-node";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Supabase Setup
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Gemini Setup
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
console.log("Gemini SDK initialized. Key present:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
  console.log("Gemini Key starts with:", process.env.GEMINI_API_KEY.slice(0, 8) + "...");
}

// Semantic Cache (Simulated In-Memory)
const semanticCache = new Map<string, { content: string; ts: number }>();

function maskSensitiveInfo(text: string) {
  if (!text) return text;
  // Email
  let masked = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
    const [user, domain] = match.split('@');
    return (user.length > 2 ? user.slice(0, 2) : user) + '***@' + domain;
  });
  // Phone (Chinese 11 digits)
  masked = masked.replace(/\b1[3-9]\d{9}\b/g, (match) => match.slice(0, 3) + '****' + match.slice(7));
  // Bank card (16-19 digits)
  masked = masked.replace(/\b\d{16,19}\b/g, (match) => match.slice(0, 4) + ' **** **** ' + match.slice(-4));
  return masked;
}

async function performAudit(prompt: string, response: string, provider: 'gemini' | 'openrouter') {
  const auditPrompt = `Audit the following AI response for safety, accuracy, logic, and PII. 
    User Prompt: ${prompt}
    AI Response: ${response}
    Return JSON: { "passed": boolean, "score": number, "reason": string }`;

  if (provider === 'gemini') {
    try {
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: auditPrompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(result.text);
    } catch (e) {
      console.error("Gemini Audit Error:", e);
      return { passed: true, score: 100, reason: "Audit skipped due to error" };
    }
  } else {
    try {
      const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-flash-1.5", // Use a cheap model for audit
          messages: [{ role: "user", content: auditPrompt }],
          response_format: { type: "json_object" }
        })
      });
      const orData = await orResponse.json();
      if (!orResponse.ok) throw new Error("OpenRouter Audit Failed");
      return JSON.parse(orData.choices[0].message.content);
    } catch (e) {
      console.error("OpenRouter Audit Error, falling back to Gemini:", e);
      return performAudit(prompt, response, 'gemini');
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Clerk Auth Middleware
  const authMiddleware = ClerkExpressWithAuth();

  console.log("Clerk Middleware initialized. Secret key present:", !!process.env.CLERK_SECRET_KEY);

  // Helper: Get or Create User
  async function getOrCreateUser(clerkId: string, email: string) {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (user) return user;

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([{ clerk_id: clerkId, email, credits: 10000, tier: "free" }])
      .select("*")
      .single();

    if (createError) throw createError;
    return newUser;
  }

  // API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API: Admin Check
  app.get("/api/admin/verify", (req, res) => {
    const key = req.query.key;
    if (key === process.env.ADMIN_KEY) {
      res.json({ ok: true, message: "Admin verified" });
    } else {
      res.status(403).json({ ok: false, message: "Invalid admin key" });
    }
  });

  // API: Get User Profile
  app.get("/api/user/me", authMiddleware, async (req: any, res) => {
    try {
      if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
      
      const user = await getOrCreateUser(req.auth.userId, "user@example.com");
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API: Get Chat Advice (Routing & Arbitrage)
  app.post("/api/chat/advice", authMiddleware, async (req: any, res) => {
    try {
      if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
      const { prompt, model: requestedModel } = req.body;
      
      const user = await getOrCreateUser(req.auth.userId, "user@example.com");
      if (user.credits < 10) return res.status(402).json({ error: "Insufficient credits" });

      let targetModel = requestedModel;
      let tier = "L2";
      let savings = 0;
      let isArbitrage = false;

      const complexityKeywords = ["code", "分析", "program", "develop", "complex", "reasoning", "math", "logic", "deep", "expert", "write", "create", "summary", "explain"];
      const isComplex = prompt.length > 500 || complexityKeywords.some(kw => prompt.toLowerCase().includes(kw));

      if (requestedModel === "auto") {
        // Prioritize Gemini Flash to ensure it works first (as requested)
        targetModel = "gemini-3-flash-preview";
        tier = "L1";
        savings = 95;
      } else {
        const modelMap: Record<string, string> = {
          "gemini-flash": "gemini-3-flash-preview",
          "gemini-pro": "gemini-3.1-pro-preview",
          "gpt-4o": "openai/gpt-4o",
          "claude-3.5": "anthropic/claude-3-5-sonnet"
        };
        targetModel = modelMap[requestedModel] || requestedModel;
        
        if (targetModel.includes("flash") || targetModel.includes("deepseek") || targetModel.includes("llama-3.1-8b")) {
          tier = "L1";
        } else if (targetModel.includes("pro") || targetModel.includes("sonnet") || targetModel.includes("gpt-4o-mini")) {
          tier = "L2";
        } else {
          tier = "L3";
        }

        // ARBITRAGE: If they requested L2/L3 but it's not extremely complex, use L1
        if ((tier === "L2" || tier === "L3") && !isComplex) {
          targetModel = "gemini-3-flash-preview";
          isArbitrage = true;
          savings = tier === "L2" ? 60 : 90;
        }
      }

      res.json({ targetModel, tier, savings, isArbitrage });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API: Proxy for Non-Gemini Models
  app.post("/api/chat/proxy", authMiddleware, async (req: any, res) => {
    try {
      if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
      const { prompt, model: modelId, tone, history } = req.body;

      const tonePrompts: Record<string, string> = {
        playful: "Use a playful, energetic, and fun tone with emojis. ",
        cute: "Use a very cute, sweet, and anime-style girl tone. ",
        cold: "Use a cold, professional, and concise tone. "
      };
      const systemPrompt = tonePrompts[tone] || "";
      const finalPrompt = systemPrompt + prompt;

      const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "https://sunnyguard.ai",
          "X-Title": "SunnyGuard AI"
        },
        body: JSON.stringify({
          model: modelId,
          messages: [...(history || []), { role: "user", content: finalPrompt }]
        })
      });
      
      const orData = await orResponse.json();
      if (!orResponse.ok) throw new Error(orData.error?.message || "OpenRouter Error");
      
      res.json({ 
        content: orData.choices[0].message.content, 
        totalTokens: orData.usage?.total_tokens || orData.choices[0].message.content.length / 2 
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API: Report Usage & Log
  app.post("/api/chat/report", authMiddleware, async (req: any, res) => {
    try {
      if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
      const { prompt, response, model: targetModel, totalTokens, auditReport, latencyMs, advice } = req.body;

      const user = await getOrCreateUser(req.auth.userId, "user@example.com");
      const ptsConsumed = Math.max(10, totalTokens);

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ credits: user.credits - ptsConsumed })
        .eq("id", user.id)
        .select()
        .single();

      await supabase.from("chat_logs").insert([{
        user_id: user.id,
        prompt,
        response,
        model: targetModel,
        tier: advice.tier,
        pts_consumed: ptsConsumed,
        savings_percent: advice.savings,
        latency_ms: latencyMs,
        audit_passed: auditReport.passed,
        audit_report: auditReport
      }]);

      res.json({ 
        creditsLeft: updatedUser?.credits || user.credits - ptsConsumed,
        meta: {
          pts: ptsConsumed,
          savings: advice.savings,
          model: targetModel,
          tier: advice.tier
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API: Topup (Mock)
  app.post("/api/topup", authMiddleware, async (req: any, res) => {
    const { amount, method } = req.body;
    const ref = "SG-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    res.json({
      ok: true,
      ref,
      payment: {
        amount_usd: amount,
        amount_cny: "¥" + (amount * 7.3).toFixed(2),
        method,
        address: method === "usdt" ? "TL4FQUjtgz7gy6UMEx5gZsZkK2Npmkq1YH" : null,
        network: method === "usdt" ? "TRON (TRC20)" : null,
        url: method === "paypal" ? "https://www.paypal.me/Sunnyday168" : null
      }
    });
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
    console.log(`SunnyGuard AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
