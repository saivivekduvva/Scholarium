import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoArrowBack, IoBookOutline, IoVideocamOutline, IoNewspaperOutline, IoExtensionPuzzleOutline, IoCheckmarkCircle } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

const SubtopicDetail = () => {
  const { skillName, subtopicTitle } = useParams();
  const navigate = useNavigate();
  const [explanation, setExplanation] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [proSources, setProSources] = useState([]);
  const [scrapedData, setScrapedData] = useState({ articles: [], books: [], searched: false });

  const [quizLoading, setQuizLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [quizActive, setQuizActive] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [isStudied, setIsStudied] = useState(false);
  const [nextSubtopic, setNextSubtopic] = useState(null);

  const rawQuery = `${subtopicTitle} ${skillName}`;
  const query = rawQuery.replace(/\s+/g, '+');
  const tag = subtopicTitle.toLowerCase().replace(/\s+/g, '-').split('-')[0];

  useEffect(() => {
    const loadExplanation = async () => {
      setLoading(true);
      try {
        const res = await api.getExplanation(skillName, subtopicTitle);
        if (res.data.explanation && !res.data.explanation.includes("Failed")) {
          setExplanation(res.data.explanation);
          setProSources(res.data.pro_sources || []);
          setSource('Scholarium AI (Enhanced)');
        } else {
          throw new Error("Backend failed to provide explanation");
        }
      } catch (err) {
        console.error("Explanation fetch failed:", err);
        setExplanation(`### We encountered an issue. Our AI system is recalibrating.`);
        setSource('System Fallback');
      } finally {
        setLoading(false);
      }
    };

    loadExplanation();

    const fetchRefs = async () => {
      try {
        const devRes = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=4`);
        const devData = devRes.ok ? await devRes.json() : [];
        const olRes = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=4`);
        const olData = olRes.ok ? await olRes.json() : { docs: [] };
        setScrapedData({ articles: devData, books: olData.docs || [], searched: true });
      } catch (err) { console.error(err); }
    };
    fetchRefs();

    const fetchNextSubtopic = async () => {
      try {
        const res = await api.expandSkill(1, skillName, false);
        if (res.data && res.data.subtopics) {
          const subs = res.data.subtopics;
          const currentIndex = subs.findIndex(s => s.title === subtopicTitle);
          if (currentIndex !== -1 && currentIndex < subs.length - 1) {
            setNextSubtopic(subs[currentIndex + 1].title);
          }
        }
      } catch (err) { console.error("Could not fetch next subtopic", err); }
    };
    fetchNextSubtopic();
  }, [skillName, subtopicTitle, query, tag]);

  const startAssessment = async () => {
    setQuizLoading(true);
    try {
      const res = await api.startSession({
        skill_name: skillName,
        subtopic_title: subtopicTitle,
        difficulty: 'beginner',
        user_id: 1
      });
      if (res.data.practice?.questions) {
        setQuestions(res.data.practice.questions.slice(0, 4)); // Exactly 4 random questions
        setQuizActive(true);
        setQuizResult(null); // Clear previous results on fresh start
        setAnswers([]);
        setCurrentQIndex(0);
      }
    } catch (err) {
      alert("Failed to start assessment. AI Rate Limit might be reached.");
    } finally {
      setQuizLoading(false);
    }
  };

  const [feedback, setFeedback] = useState(null);

  const handleQuizAnswer = (optionIndex) => {
    if (feedback) return; // Prevent double clicks
    
    const isCorrect = optionIndex === questions[currentQIndex].correct_option;
    setFeedback({ isCorrect, selected: optionIndex });
    
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    setTimeout(() => {
      setFeedback(null);
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
      } else {
        const correctCount = newAnswers.filter(a => a).length;
        const passed = correctCount === questions.length; // Mastery requires a PERFECT score (4/4)
        setQuizResult({ passed, correctCount, total: questions.length });
        setQuizActive(false);
        
        if (passed) {
          api.markSubtopicMastered(skillName, subtopicTitle)
            .then(() => setIsStudied(true))
            .catch(err => console.error(err));
        }
      }
    }, 1200);
  };

  const awardXP = (amt) => {
    // Local XP toast trigger if available
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh', backgroundColor: 'var(--bg-page)', transition: 'background-color 0.3s ease' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted" style={{ color: 'var(--text-muted)' }}>AI is crafting your perfect explanation...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container py-5"
      style={{ maxWidth: '1100px', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', transition: 'all 0.3s ease' }}
    >
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-link text-decoration-none text-muted mb-4 p-0 d-flex align-items-center gap-2"
        style={{ color: 'var(--text-muted)' }}
      >
        <IoArrowBack /> Back to Roadmap
      </button>

      <div className="row g-5">
        {/* Main Content */}
        <div className="col-lg-8">
          <h1 className="display-5 fw-bold mb-2" style={{ fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{subtopicTitle}</h1>
          <div className="d-flex flex-wrap align-items-center gap-3 mb-5">
            <p className="text-primary fw-medium m-0" style={{ color: 'var(--accent-primary)' }}>{skillName} &bull; Deep Dive</p>
            <div 
              className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill" 
              style={{ backgroundColor: 'var(--border)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--accent-primary)' }}
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

          <div className="prose p-5 rounded-4 shadow-sm border mb-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', minHeight: '600px', color: 'var(--text-primary)' }}>
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>

          {nextSubtopic && (
            <div className="mb-5 p-4 rounded-4 border d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
              <div>
                <p className="text-muted small mb-1">Up Next</p>
                <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>{nextSubtopic}</h5>
              </div>
              <button 
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate(`/subtopic/${encodeURIComponent(skillName)}/${encodeURIComponent(nextSubtopic)}`);
                }}
                className="btn btn-primary px-4 py-2"
                style={{ borderRadius: '12px', fontWeight: 600 }}
              >
                Go to Next &rarr;
              </button>
            </div>
          )}

          {/* Mastery Assessment Section */}
          <section id="assessment" className="mt-5 pt-5 border-top" style={{ borderColor: 'var(--border)' }}>
            <div className="card border-0 shadow-lg p-5" style={{ borderRadius: '32px', background: 'var(--bg-surface)', border: '1px solid var(--border) !important' }}>
              {!quizActive && !quizResult ? (
                <div className="text-center py-4">
                  <div className="display-6 mb-3">🎓</div>
                  <h3 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Ready to prove your mastery?</h3>
                  <p className="text-muted mb-5 mx-auto" style={{ maxWidth: '450px', color: 'var(--text-muted)' }}>
                    Complete a quick 3-question assessment to verify your understanding of {subtopicTitle} and unlock the next step in your roadmap.
                  </p>
                  <button 
                    disabled={quizLoading}
                    onClick={startAssessment}
                    className="btn btn-primary btn-lg px-5 py-3 shadow-sm" 
                    style={{ borderRadius: '20px', fontWeight: 700 }}
                  >
                    {quizLoading ? 'Generating Quiz...' : 'Start Assessment'}
                  </button>
                </div>
              ) : (quizActive && questions[currentQIndex]) ? (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-5">
                    <span className="badge bg-primary px-3 py-2">QUESTION {currentQIndex + 1} OF {questions.length}</span>
                    <span className="text-muted small fw-bold" style={{ color: 'var(--text-muted)' }}>SUBTOPIC MASTERY TEST</span>
                  </div>
                  <h4 className="fw-bold mb-5" style={{ lineHeight: 1.4, color: 'var(--text-primary)' }}>{questions[currentQIndex].prompt}</h4>
                  <div className="d-flex flex-column gap-3">
                    {questions[currentQIndex].options.map((opt, i) => {
                      const isSelected = feedback?.selected === i;
                      const isCorrect = questions[currentQIndex].correct_option === i;
                      
                      let btnStyle = { borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' };
                      if (feedback) {
                        if (isCorrect) {
                          btnStyle = { 
                            ...btnStyle, 
                            borderColor: '#06C9A0', 
                            background: 'rgba(6, 201, 160, 0.05)', 
                            color: '#06C9A0',
                            boxShadow: '0 0 15px rgba(6, 201, 160, 0.4)' 
                          };
                        } else if (isSelected) {
                          btnStyle = { 
                            ...btnStyle, 
                            borderColor: '#F75C5C', 
                            background: 'rgba(247, 92, 92, 0.05)', 
                            color: '#F75C5C',
                            boxShadow: '0 0 15px rgba(247, 92, 92, 0.4)' 
                          };
                        }
                      }

                      return (
                        <button 
                          key={i}
                          disabled={!!feedback}
                          onClick={() => handleQuizAnswer(i)}
                          className={`btn text-start p-4 ${!feedback ? 'hover-lift' : ''}`} 
                          style={btnStyle}
                        >
                          <span className="fw-bold me-3" style={{ opacity: 0.5 }}>{String.fromCharCode(65 + i)}</span>
                          {opt}
                          {feedback && isCorrect && <IoCheckmarkCircle className="float-end mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  {quizResult.passed ? (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                      <div className="display-1 text-success mb-4">🏆</div>
                      <h2 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Mastery Verified!</h2>
                      <p className="text-muted mb-4" style={{ color: 'var(--text-muted)' }}>You got {quizResult.correctCount} out of {quizResult.total} correct. Scholarium has marked this subtopic as mastered.</p>
                      <button onClick={() => navigate(-1)} className="btn btn-primary px-5 py-3 rounded-pill fw-bold">Continue Journey &rarr;</button>
                    </motion.div>
                  ) : (
                    <div>
                      <div className="display-1 mb-4">✍️</div>
                      <h2 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Not quite there yet</h2>
                      <p className="text-muted mb-4" style={{ color: 'var(--text-muted)' }}>You got {quizResult.correctCount} correct. Review the explanation again and try the assessment once more to master this topic.</p>
                      <button onClick={startAssessment} className="btn btn-outline-primary px-5 py-3 rounded-pill fw-bold">Retry Assessment (Fresh Questions)</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar References */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '100px' }}>
            
            {/* Pro Sources Section */}
            <div className="card border-0 rounded-4 shadow-sm mb-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <IoNewspaperOutline className="text-primary" size={20} /> Pro Study Sources
                </h6>
                <p className="small text-muted mb-3" style={{ color: 'var(--text-muted)' }}>Verified external articles for deeper study.</p>
                <div className="d-flex flex-column gap-2">
                  {proSources.map((src, i) => (
                    <a 
                      key={i} 
                      href={src.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-outline-primary btn-sm text-start py-2 d-flex justify-content-between align-items-center"
                    >
                      <span>Study on {src.name}</span>
                      <IoExtensionPuzzleOutline size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* YouTube Section */}
            <div className="card border-0 rounded-4 shadow-sm mb-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <IoVideocamOutline className="text-danger" size={20} /> Video Tutorials
                </h6>
                <p className="small text-muted mb-4" style={{ color: 'var(--text-muted)' }}>Curated video content to visualize concepts.</p>
                <a 
                  href={`https://www.youtube.com/results?search_query=${query}+tutorial`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-danger w-100 rounded-3 py-2 fw-bold"
                >
                  Watch on YouTube
                </a>
              </div>
            </div>

            {/* Books Section */}
            <div className="card border-0 rounded-4 shadow-sm mb-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <IoBookOutline className="text-success" size={20} /> Library References
                </h6>
                <div className="d-flex flex-column gap-3">
                  {scrapedData.books.length > 0 ? scrapedData.books.map((b, i) => (
                    <div key={i}>
                      <div className="fw-bold small" style={{ color: 'var(--text-primary)' }}>{b.title}</div>
                      <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>{b.author_name?.[0] || 'Unknown Author'}</span> &bull; <span style={{ color: '#00843d' }}>OpenLibrary</span>
                      </div>
                      <a href={`https://openlibrary.org${b.key}`} target="_blank" rel="noreferrer" className="small text-primary text-decoration-none" style={{ fontSize: '11px' }}>View Details</a>
                    </div>
                  )) : <p className="small text-muted" style={{ color: 'var(--text-muted)' }}>No books found.</p>}
                </div>
              </div>
            </div>

          </div>
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
