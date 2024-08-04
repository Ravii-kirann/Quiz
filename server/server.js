const express = require('express');
const cors = require('cors');
const connectDB = require('./DB/connection');
const socketIo = require('socket.io');
const http = require('http');
const Question = require('./models/question');
const quizRoutes = require('./routes/quizRoutes');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


connectDB();

app.use(express.json());
app.use(cors());


app.use('/api/quiz', quizRoutes);

app.use(express.static(path.join(__dirname, '../client/public')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/public', 'index.html'));
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('createRoom', (callback) => {
    console.log(callback)
    try {
      const roomId = generateRoomId();
      console.log('Creating room:', roomId);
      rooms[roomId] = {
        players: [socket.id],
        scores: {},
        startTime: null,
        questions: [],       };
      socket.join(roomId);
      callback(roomId);
    } catch (error) {
      console.error('Error creating room:', error);
      callback(null, 'Error creating room');
    }
  });

  socket.on('joinRoom', (roomId, callback) => {
    try {
      const room = rooms[roomId];
      if (room && room.players.length < 3) {
        room.players.push(socket.id);
        socket.join(roomId);
        callback(null, roomId);
        io.to(roomId).emit('startGame', roomId);
      } else {
        callback('Room is full or does not exist');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      callback('Error joining room');
    }
  });

  socket.on('answer', async ({ roomId, answer, questionIndex, timestamp }, callback) => {
    try {
      const room = rooms[roomId];
      if (!room) return callback('Room not found');

     
      const question = await Question.findById(room.questions[questionIndex]._id);
      if (question.correctAnswerIndex === answer) {
        const score = 10 - (timestamp - room.startTime) / 1000; 
        room.scores[socket.id] = (room.scores[socket.id] || 0) + score;
      }

     
      if (Object.keys(room.scores).length === 2) {
      
        const players = room.players.map(id => ({
          id,
          score: room.scores[id],
          time: timestamp - room.startTime
        }));

        players.sort((a, b) => b.score - a.score || a.time - b.time); 

        io.to(roomId).emit('gameOver', players);
        delete rooms[roomId];
      }

      callback(room.scores[socket.id]);
    } catch (error) {
      console.error('Error handling answer:', error);
      callback('Error handling answer');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    try {
      for (const roomId in rooms) {
        const room = rooms[roomId];
        const index = room.players.indexOf(socket.id);
        if (index > -1) {
          room.players.splice(index, 1);
          if (room.players.length === 0) {
            delete rooms[roomId];
          }
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 8);
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 