import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS COMPLETO — Resolve seu erro no GitHub Pages
app.use(cors({
  origin: "*",
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
}));

// ✅ Necessário para evitar ERR_FAILED no Render
app.options("*", cors());

// ----------------------
// OpenAI Config
// ----------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ----------------------
// ROTA PRINCIPAL
// ----------------------
app.post("/", async (req, res) => {
  try {
    const { tema, semanas, instrucoes } = req.body;

    const prompt = `
    Gere 7 devocionais + 1 estudo semanal no formato:
    {
      "devocionais": ["...", "..."],
      "estudo": "..."
    }
    Tema: ${tema}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.65
    });

    let content = completion.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "");

    res.json(JSON.parse(content));

  } catch (e) {
    console.log("ERRO AI:", e);

    return res.json({
      devocionais: [
        "Fallback Devocional 1",
        "Fallback Devocional 2",
        "Fallback Devocional 3",
        "Fallback Devocional 4",
        "Fallback Devocional 5",
        "Fallback Devocional 6",
        "Fallback Devocional 7",
      ],
      estudo: "Fallback Estudo"
    });
  }
});

// Porta
app.listen(process.env.PORT || 3000, () =>
  console.log("✅ Backend ativo com CORS habilitado")
);
