// services/ragService.js
import fs from 'fs';
import path from 'path';
import { getEmbedding } from './embeddingService.js';

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const mA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const mB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if ((mA * mB) === 0) return 0;
    return dotProduct / (mA * mB);
}

export async function retrieveRelevantChunks(query, topK = 3) {
    // 📂 Target your actual tracking folder path
    const embeddingsDir = path.join(process.cwd(), 'embeddings');
    
    if (!fs.existsSync(embeddingsDir)) {
        console.warn(`⚠️ Embeddings folder directory not found at: ${embeddingsDir}`);
        return [];
    }

    let allChunks = [];

    try {
        // 1. Read all separate policy vector files inside the directory dynamically
        const files = fs.readdirSync(embeddingsDir);

        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(embeddingsDir, file);
                const rawData = fs.readFileSync(filePath, 'utf8');
                const fileChunks = JSON.parse(rawData);
                
                // Add chunks into our master search pool array
                allChunks = allChunks.concat(fileChunks);
            }
        }
    } catch (err) {
        console.error("Error reading vector files from storage:", err);
        return [];
    }

    if (allChunks.length === 0) {
        console.warn("⚠️ Vector store is completely empty. Run your generator workspace.");
        return [];
    }

    // 2. Translate current incoming text prompt query into a math vector coordinate
    const queryEmbedding = await getEmbedding(query);

    // 3. Compute cosine distances across your entire combined vector repository
    const scoredChunks = allChunks.map(chunk => {
        const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
        return { 
            text: chunk.text, 
            source: chunk.source || "Unknown Document", 
            score: similarity 
        };
    });

    // 4. Sort based on highest conceptual relevance match
    scoredChunks.sort((a, b) => b.score - a.score);
    
    // Extract top matches
    return scoredChunks.slice(0, topK);
}