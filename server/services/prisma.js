/**
 * server/services/prisma.js
 * Single shared PrismaClient for the process.
 *
 * Neon closes idle connections aggressively, so point DATABASE_URL at the
 * *pooled* endpoint (the host containing `-pooler`). DIRECT_URL should hold the
 * unpooled endpoint — Prisma Migrate needs a direct connection for DDL.
 */
const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.');
  process.exit(1);
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
});

/** Verify connectivity at boot so a bad URL fails loudly instead of per-request. */
async function connectDb() {
  await prisma.$connect();
  const [{ now }] = await prisma.$queryRaw`SELECT now()`;
  console.log(`PostgreSQL connected (Neon) — server time ${now.toISOString()}`);
}

async function disconnectDb() {
  await prisma.$disconnect();
}

module.exports = { prisma, connectDb, disconnectDb };
