// socket 연결 요청을 보내는 코드
// window.location.host
const socket = new WebSocket(`ws://${window.location.host}`);
