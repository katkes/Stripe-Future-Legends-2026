import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function start() { await connectDatabase(); app.listen(env.port, () => console.info(`OpenBasket API listening on port ${env.port}`)); }
void start();
