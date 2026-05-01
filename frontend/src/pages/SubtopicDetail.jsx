import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoArrowBack, IoExtensionPuzzleOutline, IoCheckmarkCircle } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';

// Services
import api from '../services/api';
import resourceService from '../services/resourceService';

// Components
import AssessmentComponent from '../components/AssessmentComponent';
import ResourceSidebar from '../components/ResourceSidebar';

const SubtopicDetail = () => {
  const { goalId, skillName, subtopicTitle } = useParams();
  const navigate = useNavigate();

  // State
  const [explanation, setExplanation] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [proSources, setProSources] = useState([]);
  const [books, setBooks] = useState([]);
  const [isStudied, setIsStudied] = useState(false);
  const [nextSubtopic, setNextSubtopic] = useState(null);

  const query = `${subtopicTitle} ${skillName}`;
  const tag = subtopicTitle.toLowerCase().replace(/\s+/g, '-').split('-')[0];

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        // Fetch explanation
        const res = await api.getExplanation(skillName, subtopicTitle, goalId);
        if (res.data.explanation && !res.data.explanation.includes("Failed")) {
          setExplanation(res.data.explanation);
          setProSources(res.data.pro_sources || []);
          setSource('Scholarium AI (Enhanced)');
        } else {
          throw new Error("Backend failed to provide explanation");
        }

        // Fetch external resources
        const bookData = await resourceService.fetchOpenLibraryBooks(query);
        setBooks(bookData);

        // Use goalId from params instead of heuristic
        if (goalId) {
          const subsRes = await api.expandSkill(goalId, skillName, false);
          if (subsRes.data?.subtopics) {
            const subs = subsRes.data.subtopics;
            const currentIndex = subs.findIndex(s => s.title === subtopicTitle);
            if (currentIndex !== -1 && currentIndex < subs.length - 1) {
              setNextSubtopic(subs[currentIndex + 1].title);
            }
          }
        }

      } catch (err) {
        console.error("Content loading failed:", err);
        setExplanation(`### We encountered an issue. Our AI system is recalibrating.`);
        setSource('System Fallback');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [skillName, subtopicTitle, query]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh', backgroundColor: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted">AI is crafting your perfect explanation...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container py-5"
      style={{ maxWidth: '1100px', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      <motion.button 
        whileHover={{ x: -5, color: 'var(--accent-primary)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)} 
        className="btn btn-link text-decoration-none text-muted mb-4 p-0 d-flex align-items-center gap-2"
      >
        <IoArrowBack /> Back to Roadmap
      </motion.button>

      <div className="row g-5">
        {/* Main Content */}
        <div className="col-lg-8">
          <h1 className="display-5 fw-bold mb-2" style={{ fontFamily: 'Outfit' }}>{subtopicTitle}</h1>
          <div className="d-flex flex-wrap align-items-center gap-3 mb-5">
            <p className="text-primary fw-medium m-0">{skillName} &bull; Deep Dive</p>
            <div 
              className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill" 
              style={{ backgroundColor: 'var(--border)', fontSize: '12px', color: 'var(--accent-primary)' }}
            >
              <IoExtensionPuzzleOutline size={14} />
              <span className="fw-bold">Source: {source}</span>
            </div>
            {isStudied && (
              <div className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                <IoCheckmarkCircle className="me-1" /> MASTERED
              </div>
            )}
          </div>

          <div className="prose p-5 rounded-4 shadow-sm border mb-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', minHeight: '600px' }}>
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>

          {nextSubtopic && (
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="mb-5 p-4 rounded-4 border d-flex justify-content-between align-items-center" 
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              <div>
                <p className="text-muted small mb-1">Up Next</p>
                <h5 className="mb-0 fw-bold">{nextSubtopic}</h5>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate(`/subtopic/${goalId}/${encodeURIComponent(skillName)}/${encodeURIComponent(nextSubtopic)}`);
                }}
                className="btn btn-primary px-4 py-2"
                style={{ borderRadius: '12px', fontWeight: 600 }}
              >
                Go to Next &rarr;
              </motion.button>
            </motion.div>
          )}

          {/* Mastery Assessment Section */}
          <section id="assessment" className="mt-5 pt-5 border-top" style={{ borderColor: 'var(--border)' }}>
            <div className="card border-0 shadow-lg p-5" style={{ borderRadius: '32px', background: 'var(--bg-surface)' }}>
              <AssessmentComponent 
                skillName={skillName} 
                subtopicTitle={subtopicTitle} 
                goalId={goalId}
                onMasteryAchieved={() => setIsStudied(true)}
                navigateBack={() => navigate(-1)}
              />
            </div>
          </section>
        </div>

        {/* Sidebar References */}
        <div className="col-lg-4">
          <ResourceSidebar proSources={proSources} query={query} books={books} />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .hover-lift:hover {
          transform: translateY(-2px);
          border-color: var(--accent-primary) !important;
          box-shadow: 0 10px 20px rgba(79, 110, 247, 0.08);
        }
      `}} />
    </motion.div>
  );
};

export default SubtopicDetail;
