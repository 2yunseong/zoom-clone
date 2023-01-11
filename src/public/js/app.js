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

// video

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const cameraSelect = document.getElementById('cameraSelect');
let myStream;
let videoRoomName;

const videoWelcome = document.getElementById('videoWelcome');
const videoCall = document.getElementById('videoCall');
const videoWelcomeForm = videoWelcome.querySelector('form');

videoCall.hidden = true;

const getMedia = async (deviceId) => {
  const initialConstraints = {
    audio: true,
    video: { facingMode: { exact: 'user' } },
  };

  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    // stream 받기
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    // stream 넣기
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
};

const getCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = await devices.filter(
      (device) => device.kind === 'videoinput'
    );
    const currentCamera = cameras[0];

    cameras.forEach((camera) => {
      const cameraOption = document.createElement('option');
      cameraOption.value = camera.deviceId;
      cameraOption.innerText = camera.label;
      if (currentCamera.label == camera.label) {
        cameraOption.selected = true;
      }
      cameraSelect.appendChild(cameraOption);
    });
  } catch (error) {
    console.log(error);
  }
};

const startMedia = () => {
  videoWelcome.hidden = true;
  videoCall.hidden = false;
  getMedia();
  getCamera();
};

const handleMuteBtn = () => {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
    muteBtn.innerText = track.enabled ? 'mute' : 'unMute';
  });
};

const handleCameraBtn = () => {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
    cameraBtn.innerText = track.enabled ? 'Cam Off' : 'Cam On';
  });
};

const handleCameraChange = async () => {
  await getMedia(cameraSelect.value);
};

const handleWelcomeSubmit = (e) => {
  e.preventDefault();
  const input = videoWelcomeForm.querySelector('input');
  socket.emit('join_room', input.value, startMedia);
  input.value = '';
};

muteBtn.addEventListener('click', handleMuteBtn);
cameraBtn.addEventListener('click', handleCameraBtn);
cameraSelect.addEventListener('input', handleCameraChange);

videoWelcomeForm.addEventListener('submit', handleWelcomeSubmit);

socket.on('video_welcome', () => {
  console.log('someone joined.');
});
