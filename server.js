const express = require('express');
const next = require('next');
const http = require('http');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  // attach io to server so API routes can access via HTTP call to /socket/emit
  server.set('io', io);

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socket.on('join', (room) => {
      socket.join(room);
    });
    socket.on('disconnect', ()=> {
      console.log('socket disconnected', socket.id);
    });
  });

  // simple HTTP endpoint for internal emits (API routes can POST here)
  server.use(express.json({ limit: '5mb' }));
  server.post('/socket/emit', (req, res) => {
    const { event, payload, room } = req.body || {};
    if(room) io.to(room).emit(event, payload);
    else io.emit(event, payload);
    res.json({ ok: true });
  });

  // Serve uploads (this demo still allows public uploads to be proxied)
  server.post('/socket/upload-test', (req,res)=>{ res.json({ok:true}) });

  // let Next handle everything else (pages + api)
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port} - with Socket.IO`);
  });
});
