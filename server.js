import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Sua chave fica SOMENTE no Render
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

if (!OPENROUTER_KEY) {
  console.error("❌ ERRO: Variável OPENROUTER_KEY não encontrada!");
  process.exit(1);
}

// ✅ Rota principal: gerar devocionais
app.post("/gerar", async (req, res) => {
  try {
    const { tema } = req.body;

    if (!tema) {
      return res.status(400).json({ erro: "Tema obrigatório." });
    }

    const prompt = `
Você é um teólogo cristão e deve criar:
- 7 devocionais curtas baseadas no evangelho bíblico em tradução NAA
- 1 estudo semanal profundo baseado no tema "${tema}"

Formato da resposta:
{
  "devocionais": ["texto 1", "texto 2", ...],
  "estudo": "texto completo"
}
`;

    const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/mistral-large",
        messages: [
          {
            role: "system",
            content: "Você gera devocionais bíblicas profundas e fiéis ao texto da NAA."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await resposta.json();

    console.log("🔥 Resposta OpenRouter:", JSON.stringify(data, null, 2));

    // Extrai o texto retornado
    const texto = data.choices[0].message.content;

    // Tenta converter o JSON que a IA devolve
    const jsonParsed = JSON.parse(texto);

    return res.json(jsonParsed);

  } catch (err) {
    console.error("❌ ERRO AO GERAR:", err);
    return res.status(500).json({ erro: "Erro ao gerar devocionais." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ API Caminhando na Palavra está rodando!");
});

// Porta do Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
