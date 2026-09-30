import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

const NVIDIA_API_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL || "openai/gpt-oss-20b";

app.use(express.json({ limit: "12mb" }));
app.use(express.static(path.join(__dirname, "public")));

function getApiKey() {
  const key = process.env.NVIDIA_API_KEY;

  if (!key || key.includes("PASTE_YOUR")) {
    const error = new Error(
      "NVIDIA_API_KEY is not configured in the .env file."
    );
    error.status = 500;
    throw error;
  }

  return key;
}

async function generateText(prompt, temperature = 0.5) {
  const apiKey = getApiKey();

  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",

    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      model: NVIDIA_MODEL,

      messages: [
        {
          role: "user",
          content: prompt
        }
      ],

      temperature,
      max_tokens: 4096,
      stream: false
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("NVIDIA API Error:", data);

    const error = new Error(
      data?.message ||
      data?.error?.message ||
      "NVIDIA API request failed."
    );

    error.status = response.status;
    throw error;
  }

  return data?.choices?.[0]?.message?.content || "";
}


/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: Boolean(process.env.NVIDIA_API_KEY),
    provider: "NVIDIA NIM",
    model: NVIDIA_MODEL
  });
});


/* =========================
   TEXT GENERATION
========================= */

app.post("/api/generate", async (req, res) => {
  try {
    const prompt = String(
      req.body?.prompt || ""
    ).trim().slice(0, 30000);

    if (!prompt) {
      return res.status(400).json({
        ok: false,
        error: "Prompt is required."
      });
    }

    const temperature =
      Number.isFinite(req.body?.temperature)
        ? req.body.temperature
        : 0.5;

    const text = await generateText(prompt, temperature);

    res.json({
      ok: true,
      text,
      model: NVIDIA_MODEL
    });

  } catch (error) {
    console.error(error);

    res.status(error.status || 500).json({
      ok: false,
      error: error.message || "AI request failed."
    });
  }
});


/* =========================
   IMAGE / OCR
========================= */

app.post("/api/vision", async (req, res) => {
  try {
    const image = req.body?.image;
    const prompt = String(
      req.body?.prompt || ""
    ).trim();

    if (!image || !image.startsWith("data:image/")) {
      return res.status(400).json({
        ok: false,
        error: "A valid image is required."
      });
    }

    if (!prompt) {
      return res.status(400).json({
        ok: false,
        error: "Prompt is required."
      });
    }

    /*
      NVIDIA models are not all multimodal.
      This endpoint is kept here so the frontend does not break.
      For OCR/image understanding, use a NVIDIA multimodal model
      configured in NVIDIA NIM.
    */

    const apiKey = getApiKey();

    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",

      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        model: NVIDIA_MODEL,

        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],

        temperature: 0.2,
        max_tokens: 4096,
        stream: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("NVIDIA Vision Error:", data);

      return res.status(response.status).json({
        ok: false,
        error:
          data?.message ||
          data?.error?.message ||
          "NVIDIA image request failed."
      });
    }

    res.json({
      ok: true,
      text: data?.choices?.[0]?.message?.content || "",
      model: NVIDIA_MODEL
    });

  } catch (error) {
    console.error(error);

    res.status(error.status || 500).json({
      ok: false,
      error: error.message || "Image AI request failed."
    });
  }
});


/* =========================
   EXPRESS 5 SAFE FALLBACK
========================= */

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});


/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log("");
  console.log("=================================");
  console.log("      EduAI Hub Started");
  console.log("=================================");
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Provider: NVIDIA NIM`);
  console.log(`Model: ${NVIDIA_MODEL}`);
  console.log("=================================");
  console.log("");
});