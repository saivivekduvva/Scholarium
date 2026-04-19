import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoalInput from '../components/GoalInput';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    api.getGoals()
      .then(res => setGoals(res.data))
      .catch(err => console.error("Failed to fetch goals:", err));
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', backgroundColor: 'var(--bg-default)' }}>
      <main className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh', paddingTop: '40px' }}>
        
        <h1 className="mb-3 text-center" style={{ fontFamily: 'Outfit', fontWeight: 600, color: 'var(--text-primary)' }}>
          What do you want to master?
        </h1>
        <p className="text-center mb-5" style={{ color: 'var(--text-secondary)' }}>Describe any goal — Scholarium maps the path.</p>

        <GoalInput />

        {goals.length > 0 && (
          <div className="mt-5 w-100" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Recent Goals</h3>
            <div className="d-flex overflow-auto pb-3 gap-3" style={{ padding: '4px' }}>
              {goals.map(goal => (
                <div key={goal.id} className="card p-3" style={{ minWidth: '220px', backgroundColor: 'var(--bg-surface)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                  <h5 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{goal.title}</h5>
                  <span className="badge mt-2 mb-3" style={{ width: 'fit-content', backgroundColor: 'var(--accent-success)', color: 'white' }}>{goal.status}</span>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate(`/graph/${goal.id}`)}>
                      Continue &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
