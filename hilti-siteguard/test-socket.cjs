const { io } = require('socket.io-client');
const socket = io('http://localhost:5555/chaos-cure', { path: '/socket.io/' });
socket.on('connect', () => {
  console.log('Connected!');
  socket.disconnect();
});
socket.on('connect_error', (err) => {
  console.error('Connection error:', err);
});
