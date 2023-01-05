const socket = io(); // client socket 생성

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const d = 10;

const handleBackendDone = (msg) => {
  console.log(`backend say: ${msg}`);
};
const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector('input');
  // 채팅방 설정 emit(event, payload, callbackfn)
  // 서버에서 실행이 완료 되면, front 에서 callbackfn 이 실행됨.
  socket.emit('room', { payload: input.value }, handleBackendDone);
};

form.addEventListener('submit', handleRoomSubmit);
