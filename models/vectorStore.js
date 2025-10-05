import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";


dotenv.config();


const uri = process.env.MONGODB_URI;
let client;

export async function getVectorStore() {
    if(!client){
        client = new MongoClient(uri);
        await client.connect();

    }

  const dbName = "db";
  const collectionName = "database";
  const collection = client.db(dbName).collection(collectionName);

  const vectorStore = new MongoDBAtlasVectorSearch(
    new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2",
      stripNewLines: true,
    }),
    {
      collection,
      indexName: "default", // index Atlas kamu
      textKey: "text",
      embeddingKey: "embedding",
    }
  );

  return vectorStore;


    
}
