

import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { client } from "../models/db";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";


export async function POST(req) {
    const dbName = "db"
    const collectionName = "database";
    const collection = client.db(dbName).collection(collectionName);

    const question = await req.text();

    const vectorStore = new MongoDBAtlasVectorSearch(
            new HuggingFaceTransformersEmbeddings({
            // apiKey: process.env.HF_API_KEY, 
            model: "Xenova/all-MiniLM-L6-v2",
            }), {
            collection,
            indexName: "default",
            textKey: "text",
            embeddingKey:"embedding",
        });

        const retriever = vectorStore.asRetriever({
            searchType:"mmr",
            searchKwargs:{
            fetchK: 20,
            lambda: 0.1,
            },
        })

    const retrieverOutput = await retriever.getRelevantDocuments(question);
    
    return Response.json(retrieverOutput);
}