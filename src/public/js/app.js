const socket = io(); // client socket 생성

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector('input');
  // 채팅방 설정 emit(event, payload, callbackfn)
  // 서버에서 실행이 완료 되면, front 에서 callbackfn 이 실행됨.
  socket.emit('enter_room', input.value, showRoom);
};

const handleMessageSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector('#msg').querySelector('input');
  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`You: ${input.value}`);
    input.value = '';
  });
};

const handleNickNameSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector('#name').querySelector('input');
  socket.emit('nickname', input.value);
};

const showRoom = (name) => {
  welcome.hidden = true;
  room.hidden = false;
  roomName = name;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector('#msg');
  const nameForm = room.querySelector('#name');
  msgForm.addEventListener('submit', handleMessageSubmit);
  nameForm.addEventListener('submit', handleNickNameSubmit);
};

const addMessage = (msg) => {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = msg;
  ul.appendChild(li);
};

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (nickname) => {
  addMessage(`${nickname}: Join.`);
});

socket.on('bye', (nickname) => {
  addMessage(`${nickname}: left.`);
});

socket.on('new_message', addMessage);
