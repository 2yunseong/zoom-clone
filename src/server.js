import http from 'http';
import WebSocket from 'ws';
import express from 'express';

const app = express();

/* pug 설정 */
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// static 설정
app.use('/public', express.static(__dirname + '/public'));
// 라우팅 설정
app.get('/', (rep, res) => res.render('home'));
app.get('/*', (rep, res) => res.redirect('/'));

const handleListen = () => console.log(`open http web server`);

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

const handleOnMessage = (message) => {
  console.group('onMessage');
  console.log('get message from browser :', message.toString('utf8'));
  console.groupEnd();
  sockets.forEach((socket) => socket.send(message.toString('utf8')));
};

// on : 어떤 이벤트가 발생했을 때 실행되는 것
wss.on('connection', (socket) => {
  console.log('Connect to Browser');
  sockets.push(socket);
  socket.on('close', handleConnectionClose);
  socket.on('message', handleOnMessage);
});

server.listen(3000, handleListen);
