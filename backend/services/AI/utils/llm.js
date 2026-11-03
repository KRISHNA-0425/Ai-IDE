import { ChatOpenRouter } from '@langchain/openrouter';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
    console.warn('[WARN] OPENROUTER_API_KEY is not defined in environment variables.');
}

 // Rigid, cost-controlled OpenRouter LLM Configuration
 // Optimized for Free / Minimal-Cost plans:
 // 
 // 1. model: Default to the 100% free OpenRouter tier ("deepseek/deepseek-chat:free").
 //    Can be overridden via OPENROUTER_MODEL in .env if needed.
 // 2. temperature: 0.1 (Strict deterministic responses, zero hallucinated tokens).
 // 3. maxTokens: 1024 (Hard limit to prevent runaway token consumption/billing).
 // 4. maxRetries: 1 (Avoids expensive exponential retry loops on failures).
 // 5. timeout: 30000 (30-second hard cutoff to prevent hanging billable connections).
 // 6. allow_fallbacks: false (Prevents OpenRouter from silently routing to expensive paid fallbacks).
 //
const llm = new ChatOpenRouter({
    apiKey: apiKey,
    model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat:free",
    temperature: 0.1,
    maxTokens: Number(process.env.MAX_TOKENS) || 1024,
    maxRetries: 1,
    timeout: 30000,
    modelKwargs: {
        provider: {
            allow_fallbacks: false
        }
    }
});

export default llm;
