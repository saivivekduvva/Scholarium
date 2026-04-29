import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle } from 'react-icons/io5';
import api from '../services/api';

const AssessmentComponent = ({ skillName, subtopicTitle, onMasteryAchieved, navigateBack }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [active, setActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const startAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.startSession({
        skill_name: skillName,
        subtopic_title: subtopicTitle,
        difficulty: 'advanced', // Enforce high difficulty for mastery
      });
      if (res.data.practice?.questions) {
        setQuestions(res.data.practice.questions.slice(0, 4));
        setActive(true);
        setResult(null);
        setAnswers([]);
        setCurrentIndex(0);
      }
    } catch (err) {
      alert("Failed to start assessment. AI Rate Limit might be reached.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    if (feedback) return;
    
    const isCorrect = optionIndex === questions[currentIndex].correct_option;
    setFeedback({ isCorrect, selected: optionIndex });
    
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const correctCount = newAnswers.filter(a => a).length;
        const passed = correctCount === questions.length; // 4/4 required for mastery
        setResult({ passed, correctCount, total: questions.length });
        setActive(false);
        
        if (passed) {
          api.markSubtopicMastered(skillName, subtopicTitle)
            .then(() => onMasteryAchieved())
            .catch(err => console.error('Error marking mastery:', err));
        }
      }
    }, 1200);
  };

  if (!active && !result) {
    return (
      <div className="text-center py-4">
        <div className="display-6 mb-3">🎓</div>
        <h3 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Ready to prove your mastery?</h3>
        <p className="text-muted mb-5 mx-auto" style={{ maxWidth: '450px', color: 'var(--text-muted)' }}>
          Complete a quick assessment to verify your understanding of {subtopicTitle} and unlock the next step in your roadmap.
        </p>
        <button 
          disabled={loading}
          onClick={startAssessment}
          className="btn btn-primary btn-lg px-5 py-3 shadow-sm" 
          style={{ borderRadius: '20px', fontWeight: 700 }}
        >
          {loading ? 'Generating Quiz...' : 'Start Assessment'}
        </button>
      </div>
    );
  }

  if (active && questions[currentIndex]) {
    const currentQuestion = questions[currentIndex];
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <span className="badge bg-primary px-3 py-2">QUESTION {currentIndex + 1} OF {questions.length}</span>
          <span className="text-muted small fw-bold" style={{ color: 'var(--text-muted)' }}>SUBTOPIC MASTERY TEST</span>
        </div>
        <h4 className="fw-bold mb-5" style={{ lineHeight: 1.4, color: 'var(--text-primary)' }}>{currentQuestion.prompt}</h4>
        <div className="d-flex flex-column gap-3">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = feedback?.selected === i;
            const isCorrect = currentQuestion.correct_option === i;
            
            let btnStyle = { borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' };
            if (feedback) {
              if (isCorrect) {
                btnStyle = { 
                  ...btnStyle, 
                  borderColor: '#06C9A0', 
                  background: 'rgba(6, 201, 160, 0.05)', 
                  color: '#06C9A0',
                  boxShadow: '0 0 15px rgba(6, 201, 160, 0.4)' 
                };
              } else if (isSelected) {
                btnStyle = { 
                  ...btnStyle, 
                  borderColor: '#F75C5C', 
                  background: 'rgba(247, 92, 92, 0.05)', 
                  color: '#F75C5C',
                  boxShadow: '0 0 15px rgba(247, 92, 92, 0.4)' 
                };
              }
            }

            return (
              <button 
                key={i}
                disabled={!!feedback}
                onClick={() => handleAnswer(i)}
                className={`btn text-start p-4 ${!feedback ? 'hover-lift' : ''}`} 
                style={btnStyle}
              >
                <span className="fw-bold me-3" style={{ opacity: 0.5 }}>{String.fromCharCode(65 + i)}</span>
                {opt}
                {feedback && isCorrect && <IoCheckmarkCircle className="float-end mt-1" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      {result.passed ? (
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
          <div className="display-1 text-success mb-4">🏆</div>
          <h2 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Mastery Verified!</h2>
          <p className="text-muted mb-4" style={{ color: 'var(--text-muted)' }}>You got {result.correctCount} out of {result.total} correct. Scholarium has marked this subtopic as mastered.</p>
          <button onClick={navigateBack} className="btn btn-primary px-5 py-3 rounded-pill fw-bold">Continue Journey &rarr;</button>
        </motion.div>
      ) : (
        <div>
          <div className="display-1 mb-4">✍️</div>
          <h2 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Not quite there yet</h2>
          <p className="text-muted mb-4" style={{ color: 'var(--text-muted)' }}>You got {result.correctCount} correct. Review the explanation again and try the assessment once more to master this topic.</p>
          <button onClick={startAssessment} className="btn btn-outline-primary px-5 py-3 rounded-pill fw-bold">Retry Assessment (Fresh Questions)</button>
        </div>
      )}
    </div>
  );
};

export default AssessmentComponent;
