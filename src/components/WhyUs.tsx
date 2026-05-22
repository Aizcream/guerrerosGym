import React from "react";
import "./WhyUs.css";

export default function WhyUs() {
  return (
    <section className="whyus-section">
      <div className="whyus-container">
        {/* Left: Image */}
        <div className="whyus-image-container">
          <img
            src="/whyus.png"
            alt="Why Us Guerreros Gym"
            className="whyus-image"
          />
          <div className="whyus-gradient-overlay"></div>
        </div>

        {/* Center: Text */}
        <div className="whyus-text-container">
          <h2 className="whyus-title">
            ¿POR QUÉ
            <br />
            ELEGIRNOS?
          </h2>
          <p className="whyus-desc">
            No somos solo un gimnasio, somos una comunidad que te lleva más
            allá.
          </p>
        </div>

        {/* Right: Stats Grid */}
        <div className="whyus-stats-container">
          <div className="stat-item">
            <span className="stat-number">300+</span>
            <span className="stat-label">GUERREROS ACTIVOS</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">15+</span>
            <span className="stat-label">ENTRENADORES EXPERTOS</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">ENFOQUE EN RESULTADOS</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              5 <span className="stat-star">★</span>
            </span>
            <span className="stat-label">CALIFICACIÓN EN GOOGLE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
