import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupCoupSocketHandlers } from './modules/games/coup/coup.socket.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Virtuality Backend', timestamp: new Date().toISOString() });
});

setupCoupSocketHandlers(io);

const PORT = Number(process.env.PORT) || 4000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Virtuality Coup Backend listening on 0.0.0.0:${PORT} (WiFi LAN Access Enabled)`);
});
