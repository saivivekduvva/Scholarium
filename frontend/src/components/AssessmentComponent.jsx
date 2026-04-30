import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle, IoArrowBackOutline, IoArrowForwardOutline, IoPlayForwardOutline } from 'react-icons/io5';
import api from '../services/api';

const AssessmentComponent = ({ skillName, subtopicTitle, goalId, onMasteryAchieved, navigateBack }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [active, setActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelections, setUserSelections] = useState([]); // Stores { selectedIndex, isCorrect, skipped }
  const [result, setResult] = useState(null);

  const startAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.startSession({
        skill_name: skillName,
        subtopic_title: subtopicTitle,
        difficulty: 'beginner',
        goal_id: goalId
      });
      if (res.data.practice?.questions) {
        const quizQuestions = res.data.practice.questions.slice(0, 5);
        setQuestions(quizQuestions);
        setActive(true);
        setResult(null);
        setUserSelections(new Array(quizQuestions.length).fill(null));
        setCurrentIndex(0);
      }
    } catch (err) {
      alert("Failed to start assessment. AI Rate Limit might be reached.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    if (userSelections[currentIndex]) return; // Already answered
    
    const isCorrect = optionIndex === questions[currentIndex].correct_option;
    const newSelections = [...userSelections];
    newSelections[currentIndex] = { selectedIndex: optionIndex, isCorrect, skipped: false };
    setUserSelections(newSelections);
  };

  const handleSkip = () => {
    if (userSelections[currentIndex]) return; // Already answered
    
    const newSelections = [...userSelections];
    newSelections[currentIndex] = { selectedIndex: null, isCorrect: false, skipped: true };
    setUserSelections(newSelections);
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishAssessment();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const finishAssessment = () => {
    const correctCount = userSelections.filter(s => s?.isCorrect).length;
    const passed = correctCount === questions.length; // 5/5 required for mastery
    setResult({ passed, correctCount, total: questions.length });
    setActive(false);
    
    if (passed) {
      api.markSubtopicMastered(skillName, subtopicTitle, goalId)
        .then(() => onMasteryAchieved())
        .catch(err => console.error('Error marking mastery:', err));
    }
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
    const selection = userSelections[currentIndex];
    const isAnswered = selection !== null;

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <span className="badge bg-primary px-3 py-2">QUESTION {currentIndex + 1} OF {questions.length}</span>
          <span className="text-muted small fw-bold" style={{ color: 'var(--text-muted)' }}>SUBTOPIC MASTERY TEST</span>
        </div>
        
        <h4 className="fw-bold mb-5" style={{ lineHeight: 1.4, color: 'var(--text-primary)' }}>{currentQuestion.prompt}</h4>
        
        <div className="d-flex flex-column gap-3 mb-5">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = selection?.selectedIndex === i;
            const isCorrect = currentQuestion.correct_option === i;
            
            let btnStyle = { borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' };
            
            if (isAnswered && !selection.skipped) {
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
                disabled={isAnswered}
                onClick={() => handleAnswer(i)}
                className={`btn text-start p-4 ${!isAnswered ? 'hover-lift' : ''}`} 
                style={btnStyle}
              >
                <span className="fw-bold me-3" style={{ opacity: 0.5 }}>{String.fromCharCode(65 + i)}</span>
                {opt}
                {isAnswered && isCorrect && !selection.skipped && <IoCheckmarkCircle className="float-end mt-1" />}
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
          <button 
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="btn d-flex align-items-center gap-2 px-4 py-2"
            style={{ fontWeight: 700, borderRadius: '12px', border: '2px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <IoArrowBackOutline /> Previous
          </button>

          {!isAnswered && (
            <button 
              onClick={handleSkip}
              className="btn d-flex align-items-center gap-2 px-4 py-2"
              style={{ fontWeight: 600, color: 'var(--text-muted)' }}
            >
              Skip Question <IoPlayForwardOutline />
            </button>
          )}

          <button 
            onClick={goToNext}
            disabled={!isAnswered}
            className="btn btn-primary d-flex align-items-center gap-2 px-5 py-2"
            style={{ fontWeight: 700, borderRadius: '12px' }}
          >
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'} <IoArrowForwardOutline />
          </button>
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
