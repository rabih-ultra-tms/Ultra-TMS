import 'reflect-metadata';

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl && !databaseUrl.includes('connection_limit=')) {
	const separator = databaseUrl.includes('?') ? '&' : '?';
	process.env.DATABASE_URL = `${databaseUrl}${separator}connection_limit=1&pool_timeout=30`;
}
