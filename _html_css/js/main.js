const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const  userList = document.getElementById('users');

// ..........Get Username and room from URL..............
const {username,room}= Qs.parse(location.search,{
  ignoreQueryPrefix:true
});
console.log(username, room);

const socket = io();

// Join chatroom...........
socket.emit('joinRoom',{username,room});

// Get room and users
socket.on('roomUsers',({room,users})=>{
  outputRoomName(room);
  outputUsers(users);
});


//.........MESSAGE FROM SERVER..............
socket.on('message',message =>{
  console.log(message);
  outputMessage(message);

  //...........sCROLL DOWN..........
  chatMessages.scrollTop = chatMessages.scrollHeight;

});

// ............MESSAGE SUBMIT.........
chatForm.addEventListener('submit', e=>{
  e.preventDefault();

  //..........GET MESSAGE TEXT................
  const msg = e.target.elements.msg.value;

  // ..........EMIT MESSAGE TO SERVER...........
  socket.emit('chatMessage',msg);

  // Clear Inputs
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});


// .........OUTPUT MESSAGE TO DOM.............
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to POM

function outputRoomName(room) {
  roomName.innerText = room;

}

// Add users to the document
function outputUsers(users) {
  userList.innerHTML = `
      ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}
