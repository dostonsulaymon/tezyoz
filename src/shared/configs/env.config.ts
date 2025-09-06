import { z } from 'zod';

const envConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().url(),
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
