import React from 'react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="bg-text-container">
        <span className="bg-text">GUERREROS</span>
        <span className="bg-text second">GYM</span>
      </div>

      <div className="hero-content">
        <div className="hero-left">
          <div className="hero-tag">
            <span className="hero-tag-dot"></span>
            ENTRENAMIENTO FUNCIONAL
          </div>
          <h1 className="hero-title">
            FORJA TU<br />MEJOR VERSIÓN
          </h1>
          <p className="hero-description">
            Entrenamiento funcional de alto rendimiento inspirado en metodologías como HYROX para transformar tu cuerpo, mente y estilo de vida.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">
              RESERVA TU PRIMERA CLASE
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="btn-secondary">
              CONOCE MÁS
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
          <div className="hero-bottom-bar">
            <div className="bottom-feature">
              <svg className="bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="bottom-text">ENTRENADORES<br/>CERTIFICADOS</span>
            </div>
            <div className="bottom-feature">
              <svg className="bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span className="bottom-text">METODOLOGÍA<br/>COMPROBADA</span>
            </div>
            <div className="bottom-feature">
              <svg className="bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="bottom-text">COMUNIDAD<br/>MOTIVADORA</span>
            </div>
            <div className="bottom-feature">
              <svg className="bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              <span className="bottom-text">RESULTADOS<br/>GARANTIZADOS</span>
            </div>
          </div>
        </div>

        <div className="hero-right-side">
          <div className="hero-image-placeholder">
            <img src="/hero-man.png" alt="Guerreros Gym Man" className="hero-image" />
          </div>

          <div className="features-card">
            <div className="feature-item">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5h11"></path><path d="M6.5 17.5h11"></path><path d="M3 6.5v11"></path><path d="M21 6.5v11"></path><path d="M8.5 6.5v11"></path><path d="M15.5 6.5v11"></path>
              </svg>
              <span className="feature-text">FUERZA<br/>FUNCIONAL</span>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="feature-text">RESISTENCIA<br/>REAL</span>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
              </svg>
              <span className="feature-text">MENTE<br/>INAQUEBRANTABLE</span>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="feature-text">COMUNIDAD<br/>QUE TE IMPULSA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
