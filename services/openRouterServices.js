import axios from "axios";

import { connectDB } from "../models/db.js";
import { OPENROUTER_API_KEY, OPENROUTER_URL } from "../config/config.js";
import { getVectorStore } from "../models/vectorStore.js";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";


/**
 * Pure logic to query vector DB and call OpenRouter.
 * @param {string} message - The user input/question
 * @returns {Promise<string>} - The AI reply
 */


// const embedding = new HuggingFaceInferenceEmbeddings({
//   model: "Xenova/all-MiniLM-L6-v2"
// })
export async function getAIResponse (message) {
  try {

    const vectorStore = await getVectorStore();

    const retriever = vectorStore.asRetriever({
      searchType: "mmr",
      searchKwargs: {
        fetchK: 20,
        lambda: 0.1,
      },
    });

    const retrieverOutput = await retriever.getRelevantDocuments(message);

    //TODO: ganti promopt
    const TEMPLATE = `Anda adalah asisten yang menjawab pertanyaan berdasarkan dokumen sejarah masa pergerakan nasional Indonesia berikut. 
    Jika pertanyaan tidak berhubungan dengan sejarah masa pergerakan nasional Indonesia, jawab: "Pertanyaan tidak terkait dengan sejarah pergerakan nasional."

    Context:
    ${retrieverOutput.map(r => r.pageContent).join("\n\n")}

    Pertanyaan: 
    ${message}
    `;

    // Panggil OpenRouter API dengan model deepseek
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          {
            role: "user",
            content: TEMPLATE,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

   if (response.data?.choices?.length > 0) {
      return response.data.choices[0].message.content; // ✅ return only string
    } else {
      throw new Error("Respons OpenRouter API tidak sesuai format.");
    }
  } catch (error) {
    console.error("OpenRouter Service Error:", error.response?.data || error.message);
    console.error("OpenRouter Service Error:", error.response?.data || error.message);
    throw error;
  }
};


export async function POST(req, res){
  try {
    const{message} = req.body;
    if(!message){
      return res.status(400).json({error:"Pesan kosong tidak bisa diproses"})


    }
    const reply = await getAIResponse(message);
    return res.json({reply});
  } catch (error) {
     console.error("OpenRouter Service Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Gagal menghubungi OpenRouter API" });
  }
}

