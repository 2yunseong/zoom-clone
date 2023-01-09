import http from 'http';
import SocketIO from 'socket.io';
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

const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

const findPublicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
};

const countUserByRoom = (roomName) => {
  return io.sockets.adapter.rooms.get(roomName).size;
};

// 연결 될 때
io.on('connection', (socket) => {
  io.sockets.emit('room_change', findPublicRooms());

  socket.onAny((event) => {
    console.log(`Event: ${event}`);
  });

  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    // 프론트에서 emit에 전달해준 콜백함수가 실행됨
    // 매개변수를 전달해 줄수도 있다! (매개변수는 문자열, 객체 등 모두 지원)
    done(roomName, countUserByRoom(roomName));
    socket
      .to(roomName)
      .emit('welcome', socket.nickname, countUserByRoom(roomName));
    io.sockets.emit('room_change', findPublicRooms());
  });

  socket.on('disconnecting', () => {
    const enterRooms = socket.rooms;
    enterRooms.forEach((room) => {
      // 끊기 직전이므로, 자기 자신은 빼주어야 함.
      socket.to(room).emit('bye', socket.nickname, countUserByRoom(room) - 1);
    });
  });

  socket.on('disconnect', () => {
    io.sockets.emit('room_change', findPublicRooms());
  });

  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}:${msg}`);
    done();
  });

  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
});

httpServer.listen(3000, handleListen);
