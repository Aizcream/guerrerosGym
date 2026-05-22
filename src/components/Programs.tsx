import React, { useState, useEffect } from 'react';
import './Programs.css';

export default function Programs() {
  const programs = [
    {
      id: 1,
      image: '/funcional.jpg',
      title: 'FUNCIONAL',
      subtitle: 'ALTO RENDIMIENTO',
      desc: 'Mejora tu fuerza, resistencia y condición física con entrenamientos variados y efectivos.'
    },
    {
      id: 2,
      image: '/tabata.png',
      title: 'TABATA',
      subtitle: 'ALTA INTENSIDAD',
      desc: 'Rutinas cortas e intensas diseñadas para quemar grasa y acelerar tu metabolismo al máximo.'
    },
    {
      id: 3,
      image: '/hyrox.png',
      title: 'HYROX',
      subtitle: 'ENTRENAMIENTO DE COMPETENCIA',
      desc: 'Prepárate para competencias con entrenamientos híbridos que combinan fuerza y resistencia.'
    },
    {
      id: 4,
      image: '/Rumba.jpg',
      title: 'RUMBA',
      subtitle: 'RITMO Y CARDIO',
      desc: 'Mejora tu coordinación y quema calorías mientras te diviertes al ritmo de la mejor música.'
    },
    {
      id: 5,
      image: '/tren_superior.png',
      title: 'TREN SUPERIOR',
      subtitle: 'FUERZA Y DEFINICIÓN',
      desc: 'Enfócate en desarrollar fuerza muscular en brazos, pecho, espalda y hombros.'
    },
    {
      id: 6,
      image: '/running.png',
      title: 'RUNNING',
      subtitle: 'RESISTENCIA CARDIOVASCULAR',
      desc: 'Entrenamientos diseñados para mejorar tu velocidad, resistencia y técnica de carrera.'
    },
    {
      id: 7,
      image: '/gluteo.png',
      title: 'SUPER GLÚTEO',
      subtitle: 'VOLUMEN Y TONIFICACIÓN',
      desc: 'Entrenamiento hiperenfocado en aislar y hacer crecer los músculos de los glúteos.'
    },
    {
      id: 8,
      image: '/pierna.png',
      title: 'PIERNA COMPLETA',
      subtitle: 'POTENCIA Y DESARROLLO',
      desc: 'Sesiones pesadas enfocadas en cuádriceps, isquiotibiales y pantorrillas.'
    }
  ];

  // Triplicamos el array para el efecto infinito:
  // [ ...copia, ...original, ...copia ]
  const extendedPrograms = [...programs, ...programs, ...programs];
  const [currentIndex, setCurrentIndex] = useState(programs.length);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const nextSlide = () => {
    if (!isTransitioning) setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (!isTransitioning) setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
  };

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [isTransitioning]);

  // Manejo del loop infinito sin animación de rebobinado
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (currentIndex >= programs.length * 2) {
      // Si llegamos al final del segundo bloque, saltamos al primer bloque
      timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(currentIndex - programs.length);
      }, 500); // Mismo tiempo que la transición CSS
    } else if (currentIndex <= 0) {
      // Si retrocedemos al principio del primer bloque, saltamos al segundo bloque
      timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(currentIndex + programs.length);
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [currentIndex, programs.length]);

  return (
    <section className="programs-section">
      <div className="programs-container">
        
        <div className="programs-info">
          <div className="programs-tag">
            <span className="hero-tag-dot"></span>
            PROGRAMAS
          </div>
          <h2 className="programs-title">
            ENTRENAMIENTOS DISEÑADOS PARA GANADORES
          </h2>
          <p className="programs-desc">
            Clases grupales de alta intensidad, entrenamientos personalizados y planes que se adaptan a ti. Desde principiantes hasta atletas avanzados.
          </p>
        </div>

        <div className="programs-carousel-wrapper">
          <button className="carousel-btn prev" onClick={prevSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="programs-carousel-container">
            <div 
              className="programs-carousel-track" 
              style={{ 
                transform: `translateX(-${currentIndex * (100 / 3)}%)`,
                transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
              }}
            >
              {extendedPrograms.map((prog, i) => (
                <div className="program-card-slide" key={`${prog.id}-${i}`}>
                  <div className="program-card">
                    <div className="card-image-wrapper">
                      <img src={prog.image} alt={prog.title} className="card-image" />
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{prog.title}</h3>
                      <h4 className="card-subtitle">{prog.subtitle}</h4>
                      <p className="card-desc">{prog.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="carousel-btn next" onClick={nextSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div className="programs-cta-container">
          <button className="btn-programs-cta">¡INSCRÍBETE YA!</button>
        </div>

      </div>
    </section>
  );
}
