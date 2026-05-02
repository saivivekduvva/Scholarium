import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowBack, IoCheckmarkCircle, IoCloseCircle, IoAlertCircleOutline, IoStatsChart, IoBulbOutline } from 'react-icons/io5';
import api from '../services/api';

const RoadmapQuiz = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const res = await api.startRoadmapQuiz(goalId);
        setQuestions(res.data.questions);
        setSessionId(res.data.session_id);
        setUserAnswers(new Array(res.data.questions.length).fill(null));
        setLoading(false);
      } catch (err) {
        console.error("Failed to start quiz:", err);
        const errorMsg = err.response?.data?.error || "Failed to start quiz. Make sure you have completed subtopics.";
        alert(errorMsg);
        navigate(-1);
      }
    };
    startQuiz();
  }, [goalId, navigate]);

  const handleAnswer = (optionIndex) => {
    if (userAnswers[currentIndex] !== null) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitRoadmapQuiz(sessionId, userAnswers);
      setResult(res.data);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      const errorMsg = err.response?.data?.error || "Error submitting quiz results.";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh', background: 'var(--bg-page)' }}>
        <div className="spinner-border text-primary mb-4" role="status" />
        <h3 className="fw-bold">Generating your fresh 7-question quiz...</h3>
        <p className="text-muted">Analyzing your mastered subtopics</p>
      </div>
    );
  }

  if (result) {
    const evalResult = result?.result || {};
    const gapAnalysis = evalResult?.gap_analysis || {};
    const analyticsData = result?.analytics || {};
    return (
      <div className="container-fluid py-5" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card p-5 mx-auto text-center"
          style={{ maxWidth: '800px' }}
        >
          <div className="display-1 mb-4">
            {evalResult.accuracy_percentage >= 80 ? '🏆' : '📚'}
          </div>
          <h1 className="fw-black mb-2 h1" style={{ fontFamily: 'Outfit' }}>
            {evalResult.accuracy_percentage >= 80 ? 'Mastery Confirmed!' : 'Keep Learning!'}
          </h1>
          <p className="text-muted fs-5 mb-5">Your assessment is complete. Here's your performance breakdown.</p>

          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="p-4 rounded-4 border bg-white shadow-sm">
                <div className="text-muted small fw-bold mb-1">ACCURACY</div>
                <h2 className="fw-black text-primary mb-0">{evalResult?.accuracy_percentage || 0}%</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 border bg-white shadow-sm">
                <div className="text-muted small fw-bold mb-1">CORRECT</div>
                <h2 className="fw-black text-success mb-0">{evalResult.correct_count}</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 border bg-white shadow-sm">
                <div className="text-muted small fw-bold mb-1">WRONG</div>
                <h2 className="fw-black text-danger mb-0">{evalResult.wrong_count}</h2>
              </div>
            </div>
          </div>

          <div className="text-start p-5 rounded-4 mb-5" style={{ background: '#F1F5F9', border: '1px solid var(--border)' }}>
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <IoBulbOutline className="text-primary" /> Concept Gap Analysis
            </h4>
            
            <div className="mb-4">
              <p className="text-muted small fw-bold mb-2">AREAS FOR IMPROVEMENT</p>
              <div className="d-flex flex-wrap gap-2">
                {gapAnalysis.weak_concepts?.length > 0 ? (
                  gapAnalysis.weak_concepts.map((c, i) => (
                    <span key={i} className="badge bg-white text-danger border px-3 py-2 rounded-pill fw-bold shadow-sm">{c}</span>
                  ))
                ) : (
                  <span className="badge bg-white text-success border px-3 py-2 rounded-pill fw-bold shadow-sm">No significant gaps found!</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-muted small fw-bold mb-2">AI RECOMMENDATION</p>
              <p className="mb-0 fw-medium text-secondary" style={{ lineHeight: 1.6 }}>{gapAnalysis.summary || 'Excellent work! Continue progressing through your roadmap.'}</p>
            </div>
          </div>

          <div className="d-flex gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-outline-dark flex-fill py-3 rounded-4 fw-bold">Return to Roadmap</button>
            <button onClick={() => navigate(`/analytics/${goalId}`)} className="btn btn-primary flex-fill py-3 rounded-4 fw-bold gap-2">
              <IoStatsChart /> Performance Trends
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = userAnswers[currentIndex] !== null;

  return (
    <div className="container-fluid py-5" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="mx-auto" style={{ maxWidth: '900px' }}>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-muted fw-bold d-flex align-items-center gap-2 p-0">
            <IoArrowBack /> Exit Assessment
          </button>
          <div className="text-center">
            <p className="text-muted small fw-bold mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Roadmap Progress</p>
            <div className="d-flex gap-2">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  style={{ 
                    width: '40px', height: '6px', borderRadius: '3px',
                    background: i === currentIndex ? 'var(--accent-secondary)' : (userAnswers[i] !== null ? 'var(--accent-success)' : 'var(--border)'),
                    transition: 'all 0.3s ease'
                  }} 
                />
              ))}
            </div>
          </div>
          <div className="badge bg-dark px-3 py-2 rounded-pill">QUESTION {currentIndex + 1}/7</div>
        </div>

        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="premium-card p-5"
        >
          <p className="text-primary fw-bold small mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>{currentQuestion.related_concept}</p>
          <h2 className="fw-black mb-5 h1" style={{ lineHeight: 1.3, fontFamily: 'Outfit' }}>{currentQuestion.prompt}</h2>

          <div className="row g-4">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = userAnswers[currentIndex] === i;
              const isCorrect = currentQuestion.correct_option === i;
              
              let borderColor = 'var(--border)';
              let bgColor = 'var(--bg-surface)';
              let textColor = 'var(--text-primary)';

              if (isAnswered) {
                if (isCorrect) {
                  borderColor = 'var(--accent-success)';
                  bgColor = 'rgba(16, 185, 129, 0.05)';
                } else if (isSelected) {
                  borderColor = 'var(--accent-danger)';
                  bgColor = 'rgba(239, 68, 68, 0.05)';
                }
              } else if (isSelected) {
                borderColor = 'var(--accent-secondary)';
                bgColor = 'rgba(99, 102, 241, 0.05)';
              }

              return (
                <div className="col-md-6" key={i}>
                  <motion.button
                    whileHover={!isAnswered ? { scale: 1.02, borderColor: 'var(--accent-secondary)' } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(i)}
                    className="btn w-100 text-start p-4 h-100 d-flex align-items-center justify-content-between"
                    style={{
                      borderRadius: '20px',
                      border: `2px solid ${borderColor}`,
                      background: bgColor,
                      color: textColor,
                      fontWeight: 600,
                      boxShadow: isSelected && !isAnswered ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'var(--shadow-sm)'
                    }}
                  >
                    <span className="pe-3">{opt}</span>
                    {isAnswered && (
                      isCorrect ? <IoCheckmarkCircle size={24} className="text-success" /> : (isSelected ? <IoCloseCircle size={24} className="text-danger" /> : null)
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-top d-flex justify-content-between align-items-center">
            <p className="text-muted small fw-medium">Choose the most accurate answer based on your study.</p>
            <button 
              disabled={!isAnswered || submitting}
              onClick={handleNext}
              className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-lg"
            >
              {submitting ? 'Analyzing Results...' : (currentIndex === questions.length - 1 ? 'Complete Assessment' : 'Next Question')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoadmapQuiz;
