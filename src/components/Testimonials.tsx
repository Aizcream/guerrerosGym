import React from 'react';
import './Testimonials.css';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      image: '/avatar_carlos.png',
      quote: '"Llegué sin condición y hoy me siento más fuerte que nunca. Guerreros Gym cambió mi vida."',
      name: 'Carlos M.',
      tag: '-15KG EN 4 MESES'
    },
    {
      id: 2,
      image: '/avatar_maria.png',
      quote: '"La comunidad, los entrenadores y la metodología son lo que me mantienen motivada cada día."',
      name: 'María G.',
      tag: 'HYROX ATHLETE'
    },
    {
      id: 3,
      image: '/avatar_juan.png',
      quote: '"Entrenar aquí es diferente, no es solo físico, es mental. Te vuelves parte de algo más grande."',
      name: 'Juan P.',
      tag: '3 AÑOS EN GUERREROS'
    }
  ];

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        
        <div className="testimonials-header">
          <div className="testimonials-tag">
            <span className="hero-tag-dot"></span>
            TESTIMONIOS
          </div>
          <h2 className="testimonials-title">
            HISTORIAS DE<br />TRANSFORMACIÓN
          </h2>
        </div>

        <div className="testimonials-cards-wrapper">
          <div className="testimonials-cards">
            {testimonials.map(test => (
              <div className="testimonial-card" key={test.id}>
                <div className="test-top">
                  <img src={test.image} alt={test.name} className="test-avatar" />
                  <p className="test-quote">{test.quote}</p>
                </div>
                <div className="test-bottom">
                  <h4 className="test-name">{test.name}</h4>
                  <span className="test-label">{test.tag}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="test-controls">
            <button className="test-arrow">&lt;</button>
            <button className="test-arrow">&gt;</button>
          </div>
        </div>

      </div>
    </section>
  );
}
