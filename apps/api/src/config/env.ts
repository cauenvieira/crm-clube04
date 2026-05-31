import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appPort: toNumber(process.env.APP_PORT, 3000),
  postgres: {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: toNumber(process.env.POSTGRES_PORT, 5432),
    database: process.env.POSTGRES_DB ?? "clube04_crm",
    user: process.env.POSTGRES_USER ?? "clube04",
    password: process.env.POSTGRES_PASSWORD ?? "clube04_dev_password"
  },
  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: toNumber(process.env.REDIS_PORT, 6379)
  }
};

function toNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
