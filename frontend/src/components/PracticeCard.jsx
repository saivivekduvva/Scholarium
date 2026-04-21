import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PracticeCard = ({ question, onAnswer, onNext, feedback, isEvaluating }) => {
  const [answer, setAnswer] = React.useState('');

  React.useEffect(() => {
    setAnswer('');
  }, [question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() && !isEvaluating) onAnswer(answer);
  };

  return (
    <div className="card h-100 border-0" style={{ backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-card)', padding: '32px' }}>
      <AnimatePresence mode="wait">
        {!feedback ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '24px' }}>{question?.prompt || 'Loading question...'}</h4>
            {question?.type === 'mcq' && question.options ? (
              <div className="d-flex flex-column gap-2">
                {question.options.map((opt, i) => (
                  <button 
                    key={i} 
                    className="btn text-start p-3 d-flex justify-content-between align-items-center" 
                    style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '12px', opacity: isEvaluating ? 0.6 : 1 }}
                    onClick={() => onAnswer(opt)}
                    disabled={isEvaluating}
                  >
                    <span>{opt}</span>
                    {isEvaluating && <span className="spinner-border spinner-border-sm ms-2"></span>}
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <textarea 
                  className="form-control mb-3" 
                  rows="4" 
                  value={answer} 
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  style={{ borderRadius: '12px', border: '1px solid var(--border)' }}
                />
                  <button 
                    type="submit" 
                    className="btn w-100" 
                    style={{ backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '8px' }}
                    disabled={isEvaluating || !answer.trim()}
                  >
                    {isEvaluating ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : 'Submit to Scholarium'}
                  </button>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                display: 'inline-block', padding: '16px 24px', borderRadius: '16px',
                backgroundColor: feedback.score >= 70 ? 'var(--accent-secondary)' : 'var(--accent-warn)',
                color: 'white', fontSize: '32px', fontWeight: 700, marginBottom: '24px'
              }}
            >
              {feedback.score >= 70 ? 'Correct' : 'Incorrect'}
            </motion.div>
            <h5 className="mb-3">{feedback.verdict === 'pass' ? 'Great Job!' : 'Keep Studying!'}</h5>
            <button onClick={onNext} className="btn mt-4" style={{ backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '8px' }}>
              Next Question &rarr;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticeCard;
