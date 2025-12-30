// Prisma 7 config with Supabase Session Pooler support
import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "prisma/config";

// Load .env from project root
config({ path: resolve(__dirname, ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL for migrations/schema push, falls back to DATABASE_URL
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
