import React from 'react';
import { IoBookOutline, IoVideocamOutline, IoNewspaperOutline, IoExtensionPuzzleOutline } from 'react-icons/io5';

const ResourceSidebar = ({ proSources, query, books }) => {
  return (
    <div className="sticky-top" style={{ top: '100px' }}>
      
      {/* Pro Sources Section */}
      <div className="card border-0 rounded-4 shadow-sm mb-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <IoNewspaperOutline className="text-primary" size={20} /> Pro Study Sources
          </h6>
          <p className="small text-muted mb-3" style={{ color: 'var(--text-muted)' }}>Verified external articles for deeper study.</p>
          <div className="d-flex flex-column gap-2">
            {proSources && proSources.map((src, i) => (
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
            {books && books.length > 0 ? books.map((b, i) => (
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
  );
};

export default ResourceSidebar;
