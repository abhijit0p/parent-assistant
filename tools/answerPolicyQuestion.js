// tools/answerPolicyQuestion.js
import { policyModel } from "../services/llmRouter.js";
import { retrieveRelevantChunks } from "../services/ragService.js"; // Import the ES module function

export async function answerPolicyQuestion(parentQuery) {
  try {
    console.log(`🔍 Vector Search Execution: Fetching mathematically similar policy coordinates...`);
    
    // 1. Retrieve the top 3 conceptual matches across your policy files
    const relevantChunks = await retrieveRelevantChunks(parentQuery, 3);
    
    if (!relevantChunks || relevantChunks.length === 0) {
      console.log("⚠️ Zero context vectors returned from data store.");
      return "TRIGGER_ADMIN_ESCAPEMENT";
    }

    // 2. Map and stitch together the exact source documents extracted
    const contextualKnowledge = relevantChunks
      .map((chunk, index) => `[Context Fragment ${index + 1} | Source: ${chunk.source}]:\n${chunk.text}`)
      .join("\n\n");

    const systemPrompt = `
You are a strict administrative assistant for a parenting app. 
Your job is to answer user questions using ONLY the provided Context Fragments below.

CRITICAL RULES:
1. Do not perform any mathematical formulas or calculate hypothetical scenarios.
2. Map casual terms to official text semantically (e.g., "cash back" -> "refundable", "dues" -> "subscriptions/financing").
3. If the answer cannot be directly derived from the provided context fragments, reply EXACTLY with: "TRIGGER_ADMIN_ESCAPEMENT". Do not improvise.

Context Fragments:
${contextualKnowledge}

User Question: "${parentQuery}"
Answer:`;

    // 3. Invoke Llama 3.1 8B via Groq with a tight context payload
    const response = await policyModel.invoke(systemPrompt);
    const finalAnswer = typeof response === "string" ? response : response.content;
    
    return finalAnswer.trim();
  } catch (error) {
    console.error("Error inside the RAG policy engine:", error);
    return "TRIGGER_ADMIN_ESCAPEMENT";
  }
}