import React from 'react';
import './Header.css';

export default function Header() {
  const navItems = [
    { label: 'INICIO', href: '/' },
    { label: 'NOSOTROS', href: '#nosotros' },
    { label: 'PROGRAMAS', href: '#programas' },
    { label: 'PLANES', href: '#planes' },
    { label: 'TESTIMONIOS', href: '#testimonials' },
    { label: 'CONTACTO', href: '#contacto' },
    { label: 'RETO 2026 🏆', href: '/reto', highlight: true },
  ];

  return (
    <header className="header-container">
      <div className="logo-container" onClick={() => window.location.href = '/'}>
        <img src="/Guerreros Logo.jpeg" alt="Guerreros Gym Logo" className="logo-img" />
        <span className="logo-text">GUERREROS</span>
      </div>

      <nav>
        <ul className="nav-links">
          {navItems.map((item, index) => (
            <li key={index}>
              <a 
                href={item.href} 
                className={`nav-link ${item.highlight ? 'nav-link-reto' : ''}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <button className="cta-button" onClick={() => window.location.href = '#contacto'}>CONTACTO</button>
    </header>
  );
}
