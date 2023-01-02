const messageList = document.querySelector('ul');
const messageForm = document.querySelector('#message');
const nickForm = document.querySelector('#nick');

// socket 연결 요청을 보내는 코드
// window.location.host
const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
  const msg = { type, payload };
  return JSON.stringify(msg);
};
// 연결이 성사 되었을 때
socket.addEventListener('open', () => {
  console.log('Connected to Server ✅');
});

// 메세지를 받았을 때 - MessageEvent 객체를 받는다.
socket.addEventListener('message', (message) => {
  console.group('receive message from server');
  console.log('MessageEvent:', message);
  console.groupEnd();
  const li = document.createElement('li');
  li.innerText = message.data;
  messageList.append(li);
});

// 소켓이 닫혔을 때 - 서버가 오프라인 될 때, 끊겼을 때 등등 ..
socket.addEventListener('close', () => {
  console.log('Connected to Server ❌');
});

const handleSubmit = (e) => {
  e.preventDefault();
  const input = messageForm.querySelector('input');
  socket.send(makeMessage('message', input.value));
  input.value = '';
};

const handleNickSubmit = (e) => {
  e.preventDefault();
  const input = nickForm.querySelector('input');
  socket.send(makeMessage('nickname', input.value));
};
messageForm.addEventListener('submit', handleSubmit);
nickForm.addEventListener('submit', handleNickSubmit);
