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

const handleListen = () => console.log(`Listening on local`);

// 서버가 http, ws 프로토콜을 사용할 수 있게 만듬
// 두개의 프로토콜이 동일한 포트를 공유
// 이제 서버는 ws, http 두개의 프로토콜을 이해할 수 있음
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const handleConnection = (socket) => {
  console.log('listening on ws://localhost:3000');
};

wss.on('connection', handleConnection);

server.listen(3000, handleListen);
