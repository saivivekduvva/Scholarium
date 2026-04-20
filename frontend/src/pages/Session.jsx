import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import PracticeCard from '../components/PracticeCard';
import FeedbackPanel from '../components/FeedbackPanel';
import ProgressRing from '../components/ProgressRing';
import api from '../services/api';

const Session = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const subtopics = location.state?.subtopics || [];
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const generateMockQuestions = (topic) => [
    { id: `q1_${Date.now()}`, prompt: `Explain the core concept of "${topic}" in your own words.`, type: 'short' },
    { id: `q2_${Date.now()}`, prompt: `Which of the following best relates to ${topic}?`, type: 'mcq', options: ['A core fundamental concept', 'Something else entirely', 'Not applicable'], correct: 'A core fundamental concept' }
  ];

  useEffect(() => {
    const decodedSkillName = decodeURIComponent(skillId);
    const currentTopicTitle = subtopics[currentSubtopicIndex]?.title || decodedSkillName;
    
    api.startSession({ skill_name: currentTopicTitle, difficulty: 'beginner', user_id: 1 })
      .then(res => {
        setSessionId(res.data.session_id);
        if (res.data.practice?.questions) {
          setQuestions(res.data.practice.questions);
        } else {
          setQuestions(generateMockQuestions(currentTopicTitle));
        }
      })
      .catch(err => {
        console.error(err);
        setQuestions(generateMockQuestions(currentTopicTitle));
      });
  }, [skillId, currentSubtopicIndex]);

  const handleAnswer = (answer) => {
    const currentQ = questions[currentIndex];
    let score = 0;
    let verdict = 'fail';

    // Deterministic evaluation logic
    if (currentQ.type === 'mcq') {
      if (answer === currentQ.correct) {
        score = 100;
        verdict = 'pass';
      }
    } else {
      // Short answer heuristic
      if (answer && answer.length > 20) {
        score = 100;
        verdict = 'pass';
      } else if (answer && answer.length > 5) {
        score = 75;
        verdict = 'pass';
      } else {
        score = 40;
      }
    }

    const result = { 
      score, 
      verdict, 
      strengths: score > 70 ? ['Good understanding shown'] : [], 
      gaps: score < 100 ? ['Review the material for more depth'] : [] 
    };
    
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

  const handleNextSubtopic = () => {
    if (currentSubtopicIndex < subtopics.length - 1) {
      setCurrentSubtopicIndex(currentSubtopicIndex + 1);
      setCurrentIndex(0);
      setFeedback(null);
      setHistory([]);
      setSessionDone(false);
    } else {
      navigate(-1);
    }
  };

  if (sessionDone) {
    const isLastSubtopic = currentSubtopicIndex >= subtopics.length - 1 || subtopics.length === 0;
    
    return (
      <motion.div 
        className="d-flex flex-column justify-content-center align-items-center" 
        style={{ height: 'calc(100vh - 64px)' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="mb-4">Subtopic Complete — Scholarium</h1>
        <div style={{ fontSize: '64px', fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '32px' }}>
          +{Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)}%
        </div>
        <div>
          <button 
            className="btn me-3" 
            style={{ backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none' }} 
            onClick={handleNextSubtopic}
          >
            {isLastSubtopic ? 'Finish Skill &rarr;' : 'Next Subtopic &rarr;'}
          </button>
          {!isLastSubtopic && (
            <button className="btn" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }} onClick={() => navigate(-1)}>Return to Roadmap</button>
          )}
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
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '16px' }}>Skill Training</h4>
            {subtopics.length > 0 && (
              <div style={{ fontSize: '14px', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '32px' }}>
                {subtopics[currentSubtopicIndex]?.title}
              </div>
            )}
            
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
