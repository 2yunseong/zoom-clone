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

// on : 어떤 이벤트가 발생했을 때 실행되는 것
wss.on('connection', (socket) => {
  console.log('Connect to Browser');
  socket.on('close', () => console.log('disconnect from browser'));
  socket.on('message', (message) => console.log(message.toString('utf8')));
  socket.send('hello'); // socket으로 데이터를 보내주는 로직
});

server.listen(3000, handleListen);
