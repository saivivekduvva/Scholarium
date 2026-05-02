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
    <div className="container-fluid py-5" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="mx-auto" style={{ maxWidth: '1100px' }}>
        <motion.button 
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="btn btn-link text-decoration-none text-muted fw-bold mb-5 p-0 d-flex align-items-center gap-2"
        >
          <IoArrowBack /> Back to Roadmap
        </motion.button>

        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h1 className="display-3 fw-black" style={{ fontFamily: 'Outfit', letterSpacing: '-2px' }}>Learning Analytics</h1>
            <p className="lead text-muted fw-medium">Actionable insights from your roadmap assessments.</p>
          </div>
          <div className="badge bg-primary-subtle text-primary px-4 py-2 rounded-pill fw-bold border">
            LAST UPDATED: {new Date(data.last_updated).toLocaleDateString()}
          </div>
        </div>

        <div className="row g-4 mb-5">
          {/* Insight Card */}
          <div className="col-lg-8">
            <div className="premium-card p-5 h-100 shadow-xl">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="p-3 rounded-4 bg-primary-subtle text-primary border">
                  <IoBulbOutline size={28} />
                </div>
                <h3 className="fw-black mb-0">Smart Insights</h3>
              </div>
              <p className="fs-4 mb-0 fw-medium text-secondary" style={{ lineHeight: 1.6 }}>{data.recommendation_insight}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="col-lg-4">
            <div className="premium-card p-5 h-100 shadow-xl bg-dark text-white border-0">
              <h4 className="fw-bold mb-4 opacity-75">Quick Stats</h4>
              <div className="d-flex flex-column gap-5">
                <div>
                  <div className="d-flex align-items-center gap-2 text-white-50 fw-bold small mb-2">
                    <IoTrendingUp /> AVG ACCURACY
                  </div>
                  <div className="display-4 fw-black">
                    {Math.round((data.last_quizzes || []).reduce((acc, q) => acc + (q.accuracy || 0), 0) / (data.last_quizzes?.length || 1))}%
                  </div>
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 text-white-50 fw-bold small mb-2">
                    <IoTimeOutline /> ASSESSMENTS
                  </div>
                  <div className="display-4 fw-black">{data.accuracy_over_time?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Coverage */}
          <div className="col-md-6">
            <div className="premium-card p-5 shadow-xl">
              <h4 className="fw-black mb-5 d-flex align-items-center gap-2">
                <IoPieChartOutline className="text-primary" /> Performance by Topic
              </h4>
              <div className="d-flex flex-column gap-4">
                {Object.entries(data.subtopic_coverage || {}).map(([topic, stats], i) => {
                  const total = (stats.correct || 0) + (stats.wrong || 0);
                  const percentage = Math.round(((stats.correct || 0) / (total || 1)) * 100);
                  return (
                    <div key={i}>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold small text-truncate" style={{ maxWidth: '75%' }}>{topic}</span>
                        <span className="fw-bold text-primary">{percentage}%</span>
                      </div>
                      <div className="progress" style={{ height: '10px', borderRadius: '5px', background: '#F1F5F9' }}>
                        <div 
                          className="progress-bar transition-all" 
                          style={{ 
                            width: `${percentage}%`, 
                            background: percentage >= 70 ? 'var(--accent-success)' : (percentage >= 40 ? 'var(--accent-warn)' : 'var(--accent-danger)'), 
                            borderRadius: '5px' 
                          }}
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
            <div className="premium-card p-5 shadow-xl">
              <h4 className="fw-black mb-5">Attempt History</h4>
              <div className="d-flex flex-column gap-3">
                {(data.last_quizzes || []).slice().reverse().map((quiz, i) => (
                  <div key={i} className="p-4 rounded-4 border d-flex justify-content-between align-items-center hover-lift bg-white">
                    <div>
                      <p className="fw-bold mb-0">Assessment #{ (data.accuracy_over_time?.length || 0) - i}</p>
                      <p className="text-muted small mb-0 fw-medium">{quiz.date ? new Date(quiz.date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className={`fw-black h3 mb-0 ${ (quiz.accuracy || 0) >= 80 ? 'text-success' : 'text-primary'}`}>
                      {quiz.accuracy || 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnalytics;
