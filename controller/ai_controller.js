import { getAIResponse } from "../services/openRouterServices.js";

export async function chatWithAI (req, res) {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "Pesan kosong tidak bisa diproses." });
    }

    // Panggil service ke OpenRouter
    const reply = await getAIResponse(message);

    return res.json({ reply });
  } catch (error) {
    console.error("AI Controller Error:", error);
    return res.status(500).json({ reply: "Terjadi kesalahan pada server AI." });
  }
};


