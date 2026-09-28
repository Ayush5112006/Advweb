import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ─── Environment Loading ──────────────────────────────────────────────────────
// Kept in its own module so it can be imported FIRST by the entry file.
// ES module dependencies are evaluated in import order, before the importing
// module's body runs - reading process.env inside server.js body would happen
// too late for any module that builds config at import time (cache TTL, etc).

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '..', '..', '.env') });
