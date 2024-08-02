const express = require('express');
const { getAllQuestions, caliculateScore,addQuestion } = require('../controllers/quizController')
const router = express.Router();
router.get('/questions', getAllQuestions);
router.post('/score', caliculateScore);
router.post('/questions',addQuestion)

module.exports = router;