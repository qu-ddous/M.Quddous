const { PrismaClient } = require('@prisma/client');

const dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl) {
	throw new Error('DATABASE_URL is required. Configure Supabase Postgres connection string in environment variables.');
}

if (dbUrl.includes('file:') || dbUrl.includes('sqlite')) {
	throw new Error('SQLite/local database URL is not allowed. Use cloud PostgreSQL (Supabase) DATABASE_URL only.');
}

const prisma = new PrismaClient();

module.exports = prisma;
