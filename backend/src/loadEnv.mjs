import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// .env is placed at backend/.env (one level up from src)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export default null;
