const socket = io(); // client socket 생성

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

const showRoom = (roomName) => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;
};
const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector('input');
  // 채팅방 설정 emit(event, payload, callbackfn)
  // 서버에서 실행이 완료 되면, front 에서 callbackfn 이 실행됨.
  socket.emit('enter_room', { payload: input.value }, showRoom);
};

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', () => {
  console.log('emit welcome event');
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = 'Someone joined!';
  ul.appendChild(li);
});
