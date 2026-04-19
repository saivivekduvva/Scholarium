import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PracticeCard from '../components/PracticeCard';
import FeedbackPanel from '../components/FeedbackPanel';
import ProgressRing from '../components/ProgressRing';
import api from '../services/api';

const Session = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Decode the URL parameter just in case
    const decodedSkillName = decodeURIComponent(skillId);
    
    // Mock fetching questions
    api.startSession({ skill_name: decodedSkillName, difficulty: 'beginner', user_id: 1 })
      .then(res => {
        setSessionId(res.data.session_id);
        setQuestions(res.data.practice?.questions || [
          { id: 'q1', prompt: 'What is a REST API?', type: 'short' },
          { id: 'q2', prompt: 'HTTP status 404 means?', type: 'mcq', options: ['OK', 'Not Found', 'Server Error'] }
        ]);
      })
      .catch(err => console.error(err));
  }, [skillId]);

  const handleAnswer = (answer) => {
    // Mock evaluate call
    const result = { score: Math.floor(Math.random() * 40) + 60, verdict: 'pass', strengths: ['Good understanding'], gaps: ['Need more details'] };
    
    // In real app:
    // api.evaluateAnswer(sessionId, { question: questions[currentIndex].prompt, answer })
    //   .then(res => setFeedback(res.data))
    
    setTimeout(() => {
      setFeedback(result);
      setHistory([...history, result]);
    }, 600);
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionDone(true);
    }
  };

  if (sessionDone) {
    return (
      <motion.div 
        className="d-flex flex-column justify-content-center align-items-center" 
        style={{ height: 'calc(100vh - 64px)' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="mb-4">Session Complete — Scholarium</h1>
        <div style={{ fontSize: '64px', fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '32px' }}>
          +{history.reduce((acc, curr) => acc + curr.score, 0) / history.length}%
        </div>
        <div>
          <button className="btn me-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }} onClick={() => navigate(-1)}>Back to Skill Map</button>
          <button className="btn" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>Next Skill &rarr;</button>
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[currentIndex];
  const overallProgress = (currentIndex / (questions.length || 1)) * 100;

  return (
    <motion.div 
      className="container-fluid py-4 h-100"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <div className="row h-100 g-4">
        <div className="col-lg-3 col-md-4">
          <div className="card h-100 border-0 p-4" style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
            <div className="text-muted small fw-bold mb-2">SCHOLARIUM SESSION</div>
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '32px' }}>Skill Training</h4>
            
            <div className="d-flex justify-content-center my-4">
              <ProgressRing radius={48} stroke={8} progress={overallProgress} />
            </div>
            
            <div className="text-center text-muted fw-bold">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 col-md-8">
          <PracticeCard 
            question={currentQ} 
            onAnswer={handleAnswer} 
            onNext={handleNext} 
            feedback={feedback} 
          />
        </div>
        
        <div className="col-lg-3 d-none d-lg-block">
          <FeedbackPanel feedbackHistory={history} />
        </div>
      </div>
    </motion.div>
  );
};

export default Session;
