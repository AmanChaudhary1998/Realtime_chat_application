const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage  = require('./utils/messages');
const {userJoin, getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


//..........SET STATIC FOLDER..............
app.use(express.static(path.join(__dirname,'_html_css')));

const admin = 'admin';

//............RUN WHEN CLIENT CONNECTS.....................

io.on('connection',socket =>{
  socket.on('joinRoom',({username,room})=>{
    const user = userJoin(socket.id,username,room);

    socket.join(user.room);

//...........WELCOME CURRENT USER.........
    socket.emit('message',formatMessage(admin,"Welcome to Aman's Realtime chat application"));



// ..................BROADCAST WHEN A USER CONNECTS................
    socket.broadcast.to(user.room).emit('message',
    formatMessage(admin,`${user.username} has join the chat`));

    // Send user and room info
    io.to(user.room).emit('roomUsers',{
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });



  //.........LISTEN FOR CHATMESSAGE...........
  socket.on('chatMessage', (msg)=>{
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message',formatMessage(user.username,msg));
  });
  //.........RUNS WHEN CLIENT DISCONNECTS..................
  socket.on('disconnect',()=>{
    const user = userLeave(socket.id);

    if(user){
      io.to(user.room).emit('message',formatMessage(admin,`${user.username} has left the chat`));

      // Send user and room info
      io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
      });

    }

  });

});
const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{console.log(`Server is running on the port: ${PORT}`)});
