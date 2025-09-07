import dotenv from 'dotenv';
dotenv.config(); 

import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string(),
  DATABASE_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    _env.error.flatten().fieldErrors
  );

  throw new Error("Invalid environment variables");
}

export const env = _env.data;
