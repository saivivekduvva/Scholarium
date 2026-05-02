import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoArrowBack, IoTrendingUp, IoBulbOutline, IoPieChartOutline, IoTimeOutline } from 'react-icons/io5';
import api from '../services/api';

const QuizAnalytics = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getQuizAnalytics(goalId)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [goalId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!data || data.message) {
    return (
      <div className="container py-5 text-center">
        <div className="display-1 mb-4">📊</div>
        <h2 className="fw-bold">No quiz data yet</h2>
        <p className="text-muted mb-5">Complete your first roadmap quiz to see performance analytics here.</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary px-5 py-2 rounded-pill fw-bold">Back to Roadmap</button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <motion.button 
        whileHover={{ x: -5 }}
        onClick={() => navigate(-1)}
        className="btn btn-link text-decoration-none text-dark fw-bold mb-5 p-0 d-flex align-items-center gap-2"
      >
        <IoArrowBack /> Back to Roadmap
      </motion.button>

      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 className="display-4 fw-black" style={{ fontFamily: 'Outfit' }}>Learning Analytics</h1>
          <p className="text-muted fw-medium">Insights based on your roadmap performance.</p>
        </div>
        <div className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold">
          Updated: {new Date(data.last_updated).toLocaleDateString()}
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Insight Card */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-5 h-100" style={{ borderRadius: '32px', background: 'var(--bg-surface)' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="p-3 rounded-4 bg-primary-subtle text-primary">
                <IoBulbOutline size={28} />
              </div>
              <h4 className="fw-bold mb-0">Smart Recommendations</h4>
            </div>
            <p className="fs-5 mb-0" style={{ lineHeight: 1.6 }}>{data.recommendation_insight}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-5 h-100" style={{ borderRadius: '32px', background: 'var(--bg-surface)' }}>
            <h4 className="fw-bold mb-4">Quick Stats</h4>
            <div className="d-flex flex-column gap-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2 text-muted fw-bold small">
                  <IoTrendingUp /> AVG ACCURACY
                </div>
                <span className="fw-black h4 mb-0">
                  {Math.round(data.last_quizzes.reduce((acc, q) => acc + q.accuracy, 0) / (data.last_quizzes.length || 1))}%
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2 text-muted fw-bold small">
                  <IoTimeOutline /> TOTAL ATTEMPTS
                </div>
                <span className="fw-black h4 mb-0">{data.accuracy_over_time.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Coverage */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-5" style={{ borderRadius: '32px', background: 'var(--bg-surface)' }}>
            <h4 className="fw-bold mb-5 d-flex align-items-center gap-2">
              <IoPieChartOutline /> Performance by Topic
            </h4>
            <div className="d-flex flex-column gap-4">
              {Object.entries(data.subtopic_coverage).map(([topic, stats], i) => {
                const total = stats.correct + stats.wrong;
                const percentage = Math.round((stats.correct / (total || 1)) * 100);
                return (
                  <div key={i}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-bold small text-truncate" style={{ maxWidth: '70%' }}>{topic}</span>
                      <span className="fw-bold text-primary">{percentage}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px', borderRadius: '4px', background: 'var(--border)' }}>
                      <div 
                        className="progress-bar" 
                        style={{ width: `${percentage}%`, background: percentage >= 70 ? '#06C9A0' : (percentage >= 40 ? '#F9A825' : '#F75C5C'), borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-5 h-100" style={{ borderRadius: '32px', background: 'var(--bg-surface)' }}>
            <h4 className="fw-bold mb-5">Attempt History</h4>
            <div className="d-flex flex-column gap-3">
              {data.last_quizzes.reverse().map((quiz, i) => (
                <div key={i} className="p-3 rounded-4 border d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="fw-bold mb-0">Quiz Attempt #{data.accuracy_over_time.length - i}</p>
                    <p className="text-muted small mb-0">{new Date(quiz.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`fw-black h5 mb-0 ${quiz.accuracy >= 80 ? 'text-success' : 'text-primary'}`}>
                    {quiz.accuracy}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnalytics;
