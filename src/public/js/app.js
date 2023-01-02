const messageList = document.querySelector('ul');
const messageForm = document.querySelector('form');

// socket 연결 요청을 보내는 코드
// window.location.host
const socket = new WebSocket(`ws://${window.location.host}`);

// 연결이 성사 되었을 때
socket.addEventListener('open', () => {
  console.log('Connected to Server ✅');
});

// 메세지를 받았을 때 - MessageEvent 객체를 받는다.
socket.addEventListener('message', (message) => {
  console.group('receive message from server');
  console.log('MessageEvent:', message);
  console.log('Data:', message.data);
  console.groupEnd();
});

// 소켓이 닫혔을 때 - 서버가 오프라인 될 때, 끊겼을 때 등등 ..
socket.addEventListener('close', () => {
  console.log('Connected to Server ❌');
});

const handleSubmit = (e) => {
  e.preventDefault();
  const input = messageForm.querySelector('input');
  console.log(input.value);
  socket.send(input.value);
  input.value = '';
};

messageForm.addEventListener('submit', handleSubmit);
