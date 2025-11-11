import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
});

// ✅ Rota principal
app.get("/", (req, res) => {
    res.json({ message: "Caminhando API está online ✅" });
});

// ✅ Gerar devocionais + estudo
app.post("/generate", async (req, res) => {
    try {
        const { plan } = req.body;

        if (!plan) {
            return res.status(400).json({ error: "Plano não enviado." });
        }

        const prompt = `
        Gere um pacote devocional completo para o plano: ${plan}.
        Entregue no formato JSON:

        {
            "devocionais": [
                { "titulo": "...", "conteudo": "..." },
                { "titulo": "...", "conteudo": "..." }
            ],
            "estudo_semanal": {
                "titulo": "...",
                "conteudo": "..."
            }
        }

        Regras:
        - Gere exatamente 7 devocionais.
        - Cada devocional deve ter título e um texto com meditação + aplicação prática.
        - O estudo semanal deve ser mais profundo e estruturado.
        - Linguagem inspiradora, clara, bíblica e prática.
        `;

        const response = await client.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const json = JSON.parse(response.choices[0].message.content);
        res.json(json);

    } catch (err) {
        console.error("Erro ao gerar devocionais:", err);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

// ✅ Porta Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server online na porta ${PORT}`));
