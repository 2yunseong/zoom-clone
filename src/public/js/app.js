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

const videoWelcome = document.getElementById('videoWelcome');
const videoCall = document.getElementById('videoCall');
const videoWelcomeForm = videoWelcome.querySelector('form');

videoCall.hidden = true;

const getMedia = async (deviceId) => {
  const initialConstraints = {
    audio: true,
    video: { facingMode: 'user' },
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
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === 'video');
    videoSender.replaceTrack(videoTrack);
  }
};

const startMedia = async () => {
  videoWelcome.hidden = true;
  videoCall.hidden = false;
  await getMedia();
  await getCamera();
  makeConnection();
};

let myPeerConnection;
const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun.1.google.com:19302',
          'stun:stun.2.google.com:19302',
          'stun:stun.3.google.com:19302',
          'stun:stun.4.google.com:19302',
        ],
      },
    ],
  });
  myPeerConnection.addEventListener('icecandidate', handleIce);
  myPeerConnection.addEventListener('addstream', handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
};

const handleIce = (data) => {
  socket.emit('ice', data.candidate, videoRoomName);
};

const handleAddStream = (data) => {
  const peerStream = document
    .getElementById('peerStream')
    .querySelector('#peerFace');
  peerStream.srcObject = data.stream;
};

let videoRoomName;
const handleWelcomeSubmit = async (e) => {
  e.preventDefault();
  const input = videoWelcomeForm.querySelector('input');
  await startMedia();
  socket.emit('join_room', input.value);
  videoRoomName = input.value;
  input.value = '';
};

muteBtn.addEventListener('click', handleMuteBtn);
cameraBtn.addEventListener('click', handleCameraBtn);
cameraSelect.addEventListener('input', handleCameraChange);

videoWelcomeForm.addEventListener('submit', handleWelcomeSubmit);

// 누군가가 내 방에 들어왔을 때
socket.on('video_welcome', async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit('offer', offer, videoRoomName);
  console.log('send offer');
});

// offer
socket.on('offer', async (offer) => {
  console.log('received the offer');
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit('answer', answer, videoRoomName);
  console.log('send answer');
});

// get answer
socket.on('answer', (answer) => {
  console.log('received answer');
  myPeerConnection.setRemoteDescription(answer);
});

// get ICE
socket.on('ice', (ice) => {
  myPeerConnection.addIceCandidate(ice);
});
