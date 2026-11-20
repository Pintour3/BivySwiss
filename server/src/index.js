import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

try {
  await connectDatabase();
} catch (err) {
  console.error(`[db] connexion impossible (${err.message}). Lance d'abord : npm run db`);
  process.exit(1);
}

createApp().listen(env.port, () => {
  console.log(`[api] BivySwiss écoute sur http://localhost:${env.port}/api`);
});
