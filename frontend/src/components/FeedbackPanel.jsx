import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FeedbackPanel = ({ feedbackHistory }) => {
  const currentFeedback = feedbackHistory[feedbackHistory.length - 1];
  
  const chartData = feedbackHistory.map((f, i) => ({
    question: i + 1,
    score: f.score
  }));

  return (
    <div className="card h-100 border-0 p-4" style={{ backgroundColor: 'var(--bg-page)', borderRadius: 'var(--radius-card)' }}>
      <h5 className="mb-4" style={{ fontFamily: 'Outfit', fontWeight: 600 }}>Live Feedback</h5>
      
      {currentFeedback ? (
        <motion.div variants={{ animate: { transition: { staggerChildren: 0.1 } } }} initial="initial" animate="animate">
          <div className="mb-4">
            <div className="small text-muted fw-bold mb-2">STRENGTHS</div>
            {currentFeedback.strengths?.map((s, i) => (
              <motion.div key={i} variants={{ initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 } }} className="d-flex align-items-start mb-2 text-success">
                <span className="me-2">✓</span> <span className="small text-dark">{s}</span>
              </motion.div>
            ))}
          </div>

          <div className="mb-4">
            <div className="small text-muted fw-bold mb-2">GAPS</div>
            {currentFeedback.gaps?.map((g, i) => (
              <motion.div key={i} variants={{ initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 } }} className="d-flex align-items-start mb-2 text-warning">
                <span className="me-2">!</span> <span className="small text-dark">{g}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="text-muted small text-center mt-5">Submit an answer to see Scholarium's analysis.</div>
      )}

      {chartData.length > 0 && (
        <div className="mt-auto pt-4 border-top" style={{ borderColor: 'var(--border)' }}>
          <div className="small text-muted fw-bold mb-3">SCORE TIMELINE</div>
          <div style={{ height: '120px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="question" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
