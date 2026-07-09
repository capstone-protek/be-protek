import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL environment variable is required'),
  ML_API_URL: z.string().default('http://localhost:8000'),
  PORT: z.preprocess((val) => (val ? Number(val) : 4000), z.number()).default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CHATGPT_ENDPOINT: z.string().default('https://api.openai.com/v1/chat/completions'),
  CHATGPT_API_KEY: z.string().optional(),
  CHATGPT_MODEL_NAME: z.string().default('gpt-4o-mini'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:', JSON.stringify(result.error.format(), null, 2));
    throw new Error('Invalid environment configuration');
  }

  return result.data;
};

export const env = parseEnv();
