import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import leadHandler from './api/lead.js';
import callbackHandler from './api/callback.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4174;

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/lead', leadHandler);
app.post('/api/callback', callbackHandler);

app.listen(PORT, () => {
  console.log(`Bolalar Akademiyasi landing running on port ${PORT}`);
});
