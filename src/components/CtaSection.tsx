import React from 'react';
import './CtaSection.css';

export default function CtaSection() {
  return (
    <section className="cta-final-section">
      <div className="cta-final-container">
        
        <div className="cta-logo">
          <img src="/Guerreros Logo.jpeg" alt="Guerreros Gym" className="cta-img" />
        </div>
        
        <div className="cta-text">
          <h2 className="cta-title">¿LISTO PARA TRANSFORMAR<br />TU VIDA?</h2>
          <p className="cta-desc">Únete a Guerreros Gym y comienza tu mejor versión hoy.</p>
        </div>
        
        <div className="cta-action">
          <button className="btn-cta-final">
            RESERVA TU PRIMERA CLASE &rarr;
          </button>
        </div>

      </div>
    </section>
  );
}
