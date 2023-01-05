import http from 'http';
import WebSocket from 'ws';
// 서버가 http, ws 프로토콜을 사용할 수 있게 만듬
// 두개의 프로토콜이 동일한 포트를 공유
// 이제 서버는 ws, http 두개의 프로토콜을 이해할 수 있음
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const handleConnectionClose = () => {
  console.group('onConnectionClose');
  console.log('disconnect from browser');
  console.groupEnd();
};

/*
  fake DB
  현재 서버에 연결되어있는 소켓들
*/
const sockets = [];

const unPackMessage = (message) => {
  return JSON.parse(message);
};

// on : 어떤 이벤트가 발생했을 때 실행되는 것
wss.on('connection', (socket) => {
  console.log('Connect to Browser');
  sockets.push(socket);
  socket['nickname'] = 'guest';
  socket.on('close', handleConnectionClose);
  socket.on('message', (message) => {
    const parsed = unPackMessage(message.toString('utf8'));
    switch (parsed.type) {
      case 'message':
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${parsed.payload}`)
        );
        break;
      case 'nickname':
        socket['nickname'] = parsed.payload;
        break;
      default:
        break;
    }
  });
});

server.listen(3000, handleListen);
