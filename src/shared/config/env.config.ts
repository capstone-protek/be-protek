import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL environment variable is required'),
  ML_API_URL: z.string().default('http://localhost:8000'),
  PORT: z.preprocess((val) => (val ? Number(val) : 4000), z.number()).default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BIZNETGIO_ENDPOINT: z.string().optional(),
  BIZNETGIO_API_KEY: z.string().optional(),
  BIZNETGIO_MODEL_NAME: z.string().optional(),
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
