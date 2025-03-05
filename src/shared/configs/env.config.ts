import { z } from 'zod';

const envConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().positive(),
  // REDIS_URL: z.string().url(),
  // REDIS_PASSWORD: z.string().min(1, 'REDIS_PASSWORD must be at least 8 characters long'),
  DATABASE_USER: z.string().min(1, 'DATABASE_USER cannot be empty'),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME cannot be empty'),
  DATABASE_URL: z.string().url(),
  DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD cannot be empty'),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;

export function validateEnv(config: unknown): EnvConfig {
  const parsedConfig = envConfigSchema.safeParse(config);

  if (!parsedConfig.success) {
    const errors = parsedConfig.error.errors.map((error) => {
      return {
        field: error.path.join('.'),
        message: error.message,
      };
    });

    throw new Error(`Config validation error: ${JSON.stringify(errors)}`);
  }

  return parsedConfig.data;
}
