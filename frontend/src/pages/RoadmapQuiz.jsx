import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowBack, IoCheckmarkCircle, IoCloseCircle, IoAlertCircleOutline, IoStatsChart } from 'react-icons/io5';
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
        alert("Failed to start quiz. Make sure you have completed subtopics.");
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
      alert("Error submitting quiz results.");
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
      <div className="container py-5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-0 shadow-lg p-5 mx-auto"
          style={{ maxWidth: '800px', borderRadius: '32px', background: 'var(--bg-surface)' }}
        >
          <div className="text-center mb-5">
            <div className="display-4 mb-3">
              {evalResult.accuracy_percentage >= 80 ? '🎉' : '✍️'}
            </div>
            <h1 className="fw-bold">Quiz Results</h1>
            <p className="text-muted">Here is how you performed across your mastered topics.</p>
          </div>

          <div className="row g-4 mb-5 text-center">
            <div className="col-4">
              <div className="p-4 rounded-4 border" style={{ borderColor: 'var(--border)' }}>
                <h2 className="fw-bold text-success mb-1">{evalResult.correct_count}</h2>
                <p className="text-muted small mb-0">CORRECT</p>
              </div>
            </div>
            <div className="col-4">
              <div className="p-4 rounded-4 border" style={{ borderColor: 'var(--border)' }}>
                <h2 className="fw-bold text-danger mb-1">{evalResult.wrong_count}</h2>
                <p className="text-muted small mb-0">WRONG</p>
              </div>
            </div>
                <h2 className="fw-bold text-primary mb-1">{evalResult?.accuracy_percentage || 0}%</h2>
                <p className="text-muted small mb-0">ACCURACY</p>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <IoAlertCircleOutline /> Gap Analysis
            </h4>
            <div className="p-4 rounded-4" style={{ background: 'rgba(79, 110, 247, 0.05)', border: '2px dashed var(--border)' }}>
              <div className="mb-4">
                <p className="fw-bold text-muted small mb-2 text-uppercase">Weak Concepts</p>
                <div className="d-flex flex-wrap gap-2">
                  {gapAnalysis.weak_concepts?.length > 0 ? (
                    gapAnalysis.weak_concepts.map((c, i) => (
                      <span key={i} className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill">{c}</span>
                    ))
                  ) : (
                    <span className="text-success fw-bold">No significant weaknesses detected!</span>
                  )}
                </div>
              </div>
              <div>
                <p className="fw-bold text-muted small mb-2 text-uppercase">What To Learn Next</p>
                <p className="mb-0" style={{ lineHeight: 1.6 }}>{gapAnalysis.summary || 'Continue exploring your roadmap!'}</p>
              </div>
            </div>
          </div>

          <div className="d-flex gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-outline-dark flex-fill py-3 rounded-4 fw-bold">Back to Roadmap</button>
            <button onClick={() => navigate(`/analytics/${goalId}`)} className="btn btn-primary flex-fill py-3 rounded-4 fw-bold d-flex align-items-center justify-content-center gap-2">
              <IoStatsChart /> View Analytics
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = userAnswers[currentIndex] !== null;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-dark fw-bold d-flex align-items-center gap-2">
          <IoArrowBack /> Exit Quiz
        </button>
        <div className="text-center">
          <p className="text-muted small fw-bold mb-1 text-uppercase">Roadmap Assessment</p>
          <div className="d-flex gap-1">
            {questions.map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  width: '30px', height: '6px', borderRadius: '3px',
                  background: i === currentIndex ? 'var(--accent-primary)' : (userAnswers[i] !== null ? '#06C9A0' : 'var(--border)')
                }} 
              />
            ))}
          </div>
        </div>
        <div className="badge bg-dark px-3 py-2">Q{currentIndex + 1} OF 7</div>
      </div>

      <div className="card border-0 shadow-lg p-5 mx-auto" style={{ maxWidth: '900px', borderRadius: '32px', background: 'var(--bg-surface)' }}>
        <p className="text-primary fw-bold small mb-2 text-uppercase">{currentQuestion.related_concept}</p>
        <h2 className="fw-bold mb-5" style={{ lineHeight: 1.4 }}>{currentQuestion.prompt}</h2>

        <div className="row g-3">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = userAnswers[currentIndex] === i;
            const isCorrect = currentQuestion.correct_option === i;
            
            let borderColor = 'var(--border)';
            let bgColor = 'transparent';
            if (isAnswered) {
              if (isCorrect) {
                borderColor = '#06C9A0';
                bgColor = 'rgba(6, 201, 160, 0.05)';
              } else if (isSelected) {
                borderColor = '#F75C5C';
                bgColor = 'rgba(247, 92, 92, 0.05)';
              }
            } else if (isSelected) {
              borderColor = 'var(--accent-primary)';
            }

            return (
              <div className="col-md-6" key={i}>
                <motion.button
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(i)}
                  className="btn w-100 text-start p-4 h-100 d-flex align-items-center justify-content-between"
                  style={{
                    borderRadius: '20px',
                    border: `3px solid ${borderColor}`,
                    background: bgColor,
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{opt}</span>
                  {isAnswered && (
                    isCorrect ? <IoCheckmarkCircle size={24} color="#06C9A0" /> : (isSelected ? <IoCloseCircle size={24} color="#F75C5C" /> : null)
                  )}
                </motion.button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-top d-flex justify-content-end">
          <button 
            disabled={!isAnswered || submitting}
            onClick={handleNext}
            className="btn btn-primary px-5 py-3 rounded-pill fw-bold"
          >
            {submitting ? 'Evaluating...' : (currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapQuiz;
