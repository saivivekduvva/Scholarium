import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: '#F5F3EF',
      backgroundImage: 'radial-gradient(#00000010 1px, transparent 0)',
      backgroundSize: '24px 24px',
      color: '#1A1A1A',
      fontFamily: 'Inter, sans-serif',
      position: 'relative'
    }}>
      <nav className="d-flex justify-content-between align-items-center px-5 py-4">
        <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '-1px' }}>Scholarium</div>
        </Link>
        <div className="d-none d-md-flex gap-5" style={{ fontSize: '15px', fontWeight: 500 }}>
          <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>About</Link>
          <span style={{ cursor: 'pointer' }}>Resources</span>
        </div>
        <Link to="/contact" className="btn btn-outline-dark px-4 py-2" style={{ borderRadius: '100px', fontWeight: 600 }}>Get in touch</Link>
      </nav>

      <div className="container py-5">
        <div className="text-center mb-5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="d-flex justify-content-center gap-4 flex-wrap"
          >
            {/* Founder 1: Duvva Sai Vivek */}
            <div style={{ textAlign: 'center', maxWidth: '280px' }}>
              <div style={{ 
                width: '220px', height: '280px', 
                borderRadius: '24px', 
                border: '4px solid #1A1A1A',
                overflow: 'hidden',
                margin: '0 auto 20px',
                boxShadow: '10px 10px 0px #4F6EF7',
                backgroundColor: 'white'
              }}>
                <img src="/saivivek.jpeg" alt="Duvva Sai Vivek" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h4 style={{ fontWeight: 800, marginBottom: '5px' }}>Duvva Sai Vivek</h4>
              <p className="text-muted small">Founder, Scholarium</p>
            </div>

            {/* Founder 2: Mokshagna BC */}
            <div style={{ textAlign: 'center', maxWidth: '280px' }}>
              <div style={{ 
                width: '220px', height: '280px', 
                borderRadius: '24px', 
                border: '4px solid #1A1A1A',
                overflow: 'hidden',
                margin: '0 auto 20px',
                boxShadow: '10px 10px 0px #F4E87C',
                backgroundColor: 'white'
              }}>
                <img src="/mokshagna.jpeg" alt="Mokshagna BC" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h4 style={{ fontWeight: 800, marginBottom: '5px' }}>Mokshagna BC</h4>
              <p className="text-muted small">Co-Founder, Scholarium</p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ 
            backgroundColor: '#1A1A1A', 
            color: 'white', 
            borderRadius: '40px',
            padding: '60px 20px',
            textAlign: 'center'
          }}
        >
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 70px)', fontWeight: 900, letterSpacing: '-2px', marginBottom: '20px' }}>CONTACT US</h1>
          <p className="mx-auto mb-5" style={{ maxWidth: '600px', opacity: 0.8 }}>
            Have questions about your learning journey? We're here to help you unlock your full potential with Scholarium.
          </p>

          <div className="d-flex justify-content-center gap-5 flex-wrap mt-5">
            <div className="text-center">
              <div style={{ marginBottom: '15px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <h5 style={{ fontWeight: 800 }}>PHONE</h5>
              <p style={{ opacity: 0.7 }}>+91 91234 56789</p>
            </div>

            <div className="text-center">
              <div style={{ marginBottom: '15px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <h5 style={{ fontWeight: 800 }}>EMAIL</h5>
              <p style={{ opacity: 0.7 }}>saivivekduvva@gmail.com</p>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-5">
          <Link to="/login" className="btn btn-dark px-5 py-3" style={{ borderRadius: '100px', fontWeight: 700 }}>
            Back to Scholarium &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
