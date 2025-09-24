import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default('http://localhost:3000'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_APP_VERSION: z.string().default('0.0.0'),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
  MODE: import.meta.env.MODE,
})

export type Env = z.infer<typeof envSchema>
