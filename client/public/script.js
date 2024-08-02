let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

async function fetchQuestions() {
  try {
    const response = await fetch('https://quiz-au64.onrender.com/api/quiz/questions');
    questions = await response.json();
    displayQuestion();
  } catch (err) {
    console.error('Failed to fetch questions', err);
  }
}

function displayQuestion() {
  if (currentQuestionIndex >= questions.length) {
    calculateScore();
    return;
  }

  const question = questions[currentQuestionIndex];
  document.getElementById('question-text').innerText = question.question;

  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';
  question.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.innerText = answer;
    button.onclick = () => selectAnswer(index);
    answersDiv.appendChild(button);
  });
}

function selectAnswer(answerIndex) {
  userAnswers[currentQuestionIndex] = answerIndex;
  document.getElementById('next-button').disabled = false;
}

function nextQuestion() {
  currentQuestionIndex++;
  document.getElementById('next-button').disabled = true;
  displayQuestion();
}

async function calculateScore() {
  try {
    const response = await fetch('https://quiz-au64.onrender.com/api/quiz/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions, userAnswers }),
    });
    const result = await response.json();
    document.getElementById('result-text').innerText = `Your score: ${result.score}`;
    document.getElementById('results').style.display = 'block';
    document.getElementById('quiz-container').style.display = 'none';
  } catch (err) {
    console.error('Failed to calculate score', err);
  }
}

const socket = io('https://quiz-au64.onrender.com'); 

let roomId = null;

document.getElementById('create-room').addEventListener('click', () => {
  console.log("Create room button clicked");
  socket.emit('createRoom', (id) => {
    roomId = id;
    document.getElementById('room-id-display').innerText = `Room ID: ${roomId}`;
  });
});

document.getElementById('join-room').addEventListener('click', () => {
  const inputRoomId = document.getElementById('room-id-input').value;
  socket.emit('joinRoom', inputRoomId, (error, id) => {
    if (error) {
      alert(error);
    } else {
      roomId = id;
      document.getElementById('room-id-display').innerText = `Joined Room ID: ${roomId}`;
    }
  });
});

// Start game and handle questions
socket.on('startGame', () => {
  document.getElementById('quiz-container').style.display = 'block';
  fetchQuestions(); // Fetch questions from the server when the game starts
});

socket.on('question', (question) => {
  displayQuestion(question);
});

function selectAnswer(answerIndex) {
  userAnswers[currentQuestionIndex] = answerIndex;
  document.getElementById('next-button').disabled = false;
  const timestamp = new Date().getTime();
  socket.emit('answer', { roomId, answer: answerIndex, questionIndex: currentQuestionIndex, timestamp }, (score) => {
    console.log('Your score:', score);
  });
}

socket.on('gameOver', (results) => {
  let resultText = 'Game Over!\n';
  results.forEach((player, index) => {
    resultText += `Player ${index + 1} (${player.id}): ${player.score} points\n`;
  });
  alert(resultText);
});
