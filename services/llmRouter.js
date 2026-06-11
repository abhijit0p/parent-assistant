// llmRouter.js
// CHANGE THIS LINE:
import { Ollama } from "@langchain/ollama"; 
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";

dotenv.config();

let policyModel;
let routerModel;

if (process.env.GROQ_API_KEY) {
  console.log("⚡ Hybrid Mode: Connected to Blazing Fast Groq Cloud API (Llama 3.1 8B)");
  
  policyModel = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    temperature: 0,
  });

  routerModel = policyModel;

} else {
  console.log("🏠 Offline Mode: Falling back to Local Ollama Instance (Qwen 3B)");
  
  const localInstance = new Ollama({
    baseUrl: "http://localhost:11434",
    model: "qwen2.5:3b",
    temperature: 0,
  });

  policyModel = localInstance;
  routerModel = localInstance;
}

export { policyModel, routerModel };