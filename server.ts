import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';
import express from 'express';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Load the SSL certificate and key files
const ssl = {
  key: fs.readFileSync(path.join(__dirname, 'certificate', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificate', 'cert.pem')),
};

app.prepare().then(() => {
  const server = express();

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  createServer(ssl, server).listen(3000, () => {
    console.log('> Ready on https://localhost:3000');
  });
});
