import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fsp } from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { pipeline } from "@huggingface/transformers";

dotenv.config();

// --- INIT EMBEDDING PIPELINE (Xenova offline) ---
const extractor = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

async function embedText(text) {
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return output.tolist()[0]; // array vektor
}


const uri = process.env.MONGODB_URI; 

//deprecated way
// export const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// fungsi helper untuk connect
// export async function connectDB() {
//   if (!client.topology?.isConnected()) {
//     await client.connect();
//     console.log("✅ MongoDB connected");
//   }
//   return client;
// }

// const dbName = "db";
// const collectionName = "database";
// const collection = client.db(dbName).collection(collectionName);


//new way
// export const client = new MongoClient(uri);

export async function connectDB() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "db",
    });
     console.log("✅ MongoDB connected");

    // test ambil db & collection
    // const db = client.db("MediaPembelajaran");
    // const collections = await db.listCollections().toArray();
    // console.log("📂 Collections:", collections.map(c => c.name));

    // return db;
  } catch (err) {
    console.error("connection failed", err);
    throw err;
  }
}


// --- READ FILES ---
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const dataPath = path.join(__dirname, "data");

// const fileNames = await fsp.readdir(dataPath);
// console.log("📂 Files:", fileNames);

// // --- VECTORIZE EACH FILE ---
// for (const fileName of fileNames) {
//   const document = await fsp.readFile(`${dataPath}/${fileName}`, "utf8");
//   console.log(`📝 Vectorizing ${fileName}`);

//   const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
//     chunkSize: 500,
//     chunkOverlap: 50,
//   });

//   const docs = await splitter.createDocuments([document]);

//   for (const doc of docs) {
//     const vector = await embedText(doc.pageContent);

//     await collection.insertOne({
//       text: doc.pageContent,
//       embedding: vector,
//       metadata: doc.metadata || {},
//     });
//   }
// }

//till here

