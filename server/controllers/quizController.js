const Question = require('../models/question')

const getAllQuestions = async (req,res) =>{
      try {
        const questions = await Question.aggregate([{ $sample: { size: 5 } }]);
    res.json(questions);
      } catch (error) {
        res.status(500).json({error : "Failed to fetch question"})
      }
}

const caliculateScore = async (req,res) =>{
    const { questions, userAnswers } = req.body;
    let score = 0;
  
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswerIndex) {
        score += 10; 
      }
    });
  
    res.json({ score });
}

const addQuestion = async (req, res) => {
  console.log(req.body)

  try {
    const { question, answers, correctAnswerIndex } = req.body;
    const newQuestion = new Question({
      question,
      answers,
      correctAnswerIndex,
    });
    await newQuestion.save();
    res.status(201).json({ message: 'Question added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question' });
  }
};
module.exports = {getAllQuestions,caliculateScore,addQuestion}