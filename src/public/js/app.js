const socket = io(); // client socket 생성

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const roomname = form.querySelector('#roomname');
  const nickname = form.querySelector('#nickname');
  // 채팅방 설정 emit(event, payload, callbackfn)
  // 서버에서 실행이 완료 되면, front 에서 callbackfn 이 실행됨.
  socket.emit('nickname', nickname.value);
  socket.emit('enter_room', roomname.value, showRoom);
};

const handleMessageSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector('#msg').querySelector('input');
  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`You: ${input.value}`);
    input.value = '';
  });
};

const showRoom = (name, newCount) => {
  welcome.hidden = true;
  room.hidden = false;
  roomName = name;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  const msgForm = room.querySelector('#msg');
  msgForm.addEventListener('submit', handleMessageSubmit);
};

const addMessage = (msg) => {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = msg;
  ul.appendChild(li);
};

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (nickname, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${nickname} Join.`);
});

socket.on('bye', (nickname, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${nickname} left.`);
});

socket.on('new_message', addMessage);

socket.on('room_change', (rooms) => {
  const roomList = welcome.querySelector('ul');
  if (rooms.length === 0) {
    roomList.innerHTML = '';
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.innerText = room;
    roomList.append(li);
  });
});
