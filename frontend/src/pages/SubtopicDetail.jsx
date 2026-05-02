import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoArrowBack, IoExtensionPuzzleOutline, IoCheckmarkCircle } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';

// Services
import api from '../services/api';
import resourceService from '../services/resourceService';

// Components
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
            
            // Sync isStudied status
            const currentSub = subs.find(s => s.title.toLowerCase() === subtopicTitle.toLowerCase());
            if (currentSub) {
              setIsStudied(currentSub.is_studied);
            }

            const currentIndex = subs.findIndex(s => s.title.toLowerCase() === subtopicTitle.toLowerCase());
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-fluid py-5"
      style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}
    >
      <div className="mx-auto" style={{ maxWidth: '1000px' }}>
        {/* Navigation */}
        <motion.button 
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)} 
          className="btn btn-link text-decoration-none text-muted mb-5 p-0 d-flex align-items-center gap-2"
        >
          <IoArrowBack /> Back to Roadmap
        </motion.button>

        {/* Header Section */}
        <header className="mb-5">
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold text-uppercase" style={{ letterSpacing: '1px', fontSize: '12px' }}>
              {skillName}
            </span>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span className="text-muted fw-medium">{subtopicTitle}</span>
            {isStudied && (
              <div className="badge bg-success-subtle text-success px-3 py-2 rounded-pill ms-auto animate-pulse">
                <IoCheckmarkCircle className="me-1" /> MASTERED
              </div>
            )}
          </div>
          <h1 className="display-3 fw-black mb-4" style={{ fontFamily: 'Outfit', letterSpacing: '-2px' }}>{subtopicTitle}</h1>
          <p className="lead text-muted fw-medium" style={{ maxWidth: '700px', lineHeight: 1.6 }}>
            Master the core principles of {subtopicTitle} with our AI-curated guide and resources.
          </p>
        </header>

        <div className="row g-5">
          <div className="col-lg-8">
            {/* Main Content Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-5 mb-5 shadow-xl"
            >
              <div className="prose-content" style={{ fontSize: '18px', lineHeight: 1.8 }}>
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            </motion.div>

            {/* Next Step Card */}
            {nextSubtopic && !isStudied && (
              <div className="p-4 rounded-4 border mb-5 d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-surface)', borderStyle: 'dashed' }}>
                <div>
                  <p className="text-muted small mb-1">Coming up next</p>
                  <h5 className="mb-0 fw-bold">{nextSubtopic}</h5>
                </div>
                <div className="text-muted small">Complete this to unlock &rarr;</div>
              </div>
            )}

            {/* Mastery Action Section */}
            <section id="mastery" className="mt-5">
              <div className="card border-0 shadow-xl overflow-hidden" style={{ borderRadius: '32px', background: 'var(--bg-surface)' }}>
                <div className="row g-0">
                  <div className="col-md-7 p-5 d-flex flex-column justify-content-center">
                    {!isStudied ? (
                      <>
                        <h3 className="fw-black mb-3 h2">Conquered this topic?</h3>
                        <p className="text-muted mb-4 fs-5">
                          Marking as mastered updates your roadmap and unlocks progress analytics.
                        </p>
                        <button 
                          onClick={async () => {
                            try {
                              await api.markSubtopicMastered(skillName, subtopicTitle, goalId);
                              setIsStudied(true);
                            } catch (err) {
                              alert("Failed to mark as mastered. Please try again.");
                            }
                          }}
                          className="btn btn-primary btn-lg px-5 py-3 w-fit" 
                          style={{ borderRadius: '16px' }}
                        >
                          Mark as Mastered
                        </button>
                      </>
                    ) : (
                      <div>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div className="p-2 rounded-circle bg-success text-white">
                            <IoCheckmarkCircle size={24} />
                          </div>
                          <h3 className="fw-black mb-0 h2">Great Progress!</h3>
                        </div>
                        <p className="text-muted mb-4 fs-5">You've successfully mastered this subtopic.</p>
                        <div className="d-flex gap-3">
                          <button onClick={() => navigate(-1)} className="btn btn-outline-dark px-4 py-2 rounded-pill">Back to Roadmap</button>
                          {nextSubtopic && (
                            <button 
                              onClick={() => {
                                navigate(`/subtopic/${goalId}/${skillName}/${encodeURIComponent(nextSubtopic)}`);
                                window.scrollTo(0, 0);
                              }}
                              className="btn btn-primary px-4 py-2 rounded-pill"
                            >
                              Next Topic &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-md-5 d-none d-md-block" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', position: 'relative' }}>
                    <div className="position-absolute top-50 start-50 translate-middle text-white opacity-25">
                      <IoCheckmarkCircle size={180} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <ResourceSidebar proSources={proSources} query={query} books={books} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SubtopicDetail;
