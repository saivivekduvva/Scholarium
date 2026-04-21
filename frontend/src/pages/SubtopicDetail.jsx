import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoArrowBack, IoBookOutline, IoVideocamOutline, IoNewspaperOutline, IoExtensionPuzzleOutline } from 'react-icons/io5';
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
        setExplanation(`### We encountered an issue.
        
Our AI system is currently recalibrating or at capacity. In the meantime, please check the **"Pro Study Sources"** or **"Watch Tutorials"** on the right for high-quality external resources.`);
        setSource('System Fallback');
      } finally {
        setLoading(false);
      }
    };

    loadExplanation();

    // Fetch References (Books and Articles)
    const fetchRefs = async () => {
      try {
        const devRes = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=4`);
        const devData = devRes.ok ? await devRes.json() : [];

        const olRes = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=4`);
        const olData = olRes.ok ? await olRes.json() : { docs: [] };

        setScrapedData({
          articles: devData,
          books: olData.docs || [],
          searched: true
        });
      } catch (err) {
        console.error("Error fetching refs:", err);
      }
    };
    fetchRefs();
  }, [skillName, subtopicTitle, query, tag]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
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
      style={{ maxWidth: '1100px' }}
    >
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-link text-decoration-none text-muted mb-4 p-0 d-flex align-items-center gap-2"
      >
        <IoArrowBack /> Back to Roadmap
      </button>

      <div className="row g-5">
        {/* Main Content */}
        <div className="col-lg-8">
          <h1 className="display-5 fw-bold mb-2" style={{ fontFamily: 'Outfit' }}>{subtopicTitle}</h1>
          <div className="d-flex align-items-center gap-3 mb-5">
            <p className="text-primary fw-medium m-0">{skillName} &bull; Deep Dive</p>
            <div 
              className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill" 
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '12px', color: 'var(--accent-primary)' }}
            >
              <IoExtensionPuzzleOutline size={14} />
              <span className="fw-bold">Source: {source}</span>
            </div>
          </div>

          <div className="prose bg-white p-5 rounded-4 shadow-sm border" style={{ borderColor: 'var(--border)', minHeight: '600px' }}>
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        </div>

        {/* Sidebar References */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '100px' }}>
            
            {/* Pro Sources Section */}
            <div className="card border-0 rounded-4 shadow-sm mb-4" style={{ backgroundColor: '#fff' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <IoNewspaperOutline className="text-primary" size={20} /> Pro Study Sources
                </h6>
                <p className="small text-muted mb-3">Verified external articles for deeper study.</p>
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
            <div className="card border-0 rounded-4 shadow-sm mb-4" style={{ backgroundColor: '#fff' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <IoVideocamOutline className="text-danger" size={20} /> Video Tutorials
                </h6>
                <p className="small text-muted mb-4">Curated video content to visualize concepts.</p>
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
            <div className="card border-0 rounded-4 shadow-sm mb-4" style={{ backgroundColor: '#fff' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <IoBookOutline className="text-success" size={20} /> Library References
                </h6>
                <div className="d-flex flex-column gap-3">
                  {scrapedData.books.length > 0 ? scrapedData.books.map((b, i) => (
                    <div key={i}>
                      <div className="fw-bold text-dark small">{b.title}</div>
                      <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                        <span>{b.author_name?.[0] || 'Unknown Author'}</span> &bull; <span style={{ color: '#00843d' }}>OpenLibrary</span>
                      </div>
                      <a href={`https://openlibrary.org${b.key}`} target="_blank" rel="noreferrer" className="small text-primary text-decoration-none" style={{ fontSize: '11px' }}>View Details</a>
                    </div>
                  )) : <p className="small text-muted">No books found.</p>}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SubtopicDetail;
