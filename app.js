const express = require('express');
const path = require('path');
const https = require('https');

const app = express();

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log('port is running');
});

//serving static file
app.use(express.static(path.join(__dirname, 'public')));

const io = require('socket.io')(server);

const clientConnected = new Set();

const onConnected = socket => {
  clientConnected.add(socket.id);
  io.emit('client-total', clientConnected.size);

  socket.on('disconnect', () => {
    clientConnected.delete(socket.id);
    io.emit('client-total', clientConnected.size);
  });

  socket.on('message', data => {
    socket.broadcast.emit('chat-message', data);
  });

  socket.on('feedack', data => {
    socket.broadcast.emit('typing', data);
  });
};

io.on('connection', onConnected);
