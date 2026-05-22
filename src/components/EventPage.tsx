import React, { useState } from 'react';
import './EventPage.css';

interface MemberData {
  nombre: string;
  correo: string;
  cedula: string;
  celular: string;
  tipoSangre: string;
  contactoNombre: string;
  contactoCelular: string;
  genero: string;
}

export default function EventPage() {
  // Navigation active section
  const [activeNav, setActiveNav] = useState('inicio');

  // Form Step State
  // Steps: 'equipo' | 'integrante1' | 'integrante2' | 'integrante3' | 'pago'
  const [currentStep, setCurrentStep] = useState<'equipo' | 'integrante1' | 'integrante2' | 'integrante3' | 'resumen'>('equipo');

  // Form Values
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<MemberData[]>([
    { nombre: '', correo: '', cedula: '', celular: '', tipoSangre: 'O+', contactoNombre: '', contactoCelular: '', genero: 'Masculino' },
    { nombre: '', correo: '', cedula: '', celular: '', tipoSangre: 'O+', contactoNombre: '', contactoCelular: '', genero: 'Masculino' },
    { nombre: '', correo: '', cedula: '', celular: '', tipoSangre: 'O+', contactoNombre: '', contactoCelular: '', genero: 'Masculino' },
  ]);

  // Form Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modals & Interactive States
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNequi, setCopiedNequi] = useState(false);

  // Price variables
  const pricePerPerson = 40000;
  const totalPrice = 120000;

  // Handle member field changes
  const handleMemberChange = (index: number, field: keyof MemberData, value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    setMembers(updatedMembers);

    // Clear error for this field
    const errorKey = `member_${index}_${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  // Helper validation functions
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateStep = (step: typeof currentStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'equipo') {
      if (!teamName.trim()) {
        newErrors.teamName = 'El nombre del equipo es obligatorio';
      } else if (teamName.trim().length < 3) {
        newErrors.teamName = 'El nombre debe tener al menos 3 caracteres';
      }
    }

    const validateMemberIndex = (index: number) => {
      const m = members[index];
      const prefix = `member_${index}_`;

      if (!m.nombre.trim()) {
        newErrors[`${prefix}nombre`] = 'El nombre completo es obligatorio';
      }
      if (!m.correo.trim()) {
        newErrors[`${prefix}correo`] = 'El correo electrónico es obligatorio';
      } else if (!validateEmail(m.correo)) {
        newErrors[`${prefix}correo`] = 'Formato de correo electrónico inválido';
      }
      if (!m.cedula.trim()) {
        newErrors[`${prefix}cedula`] = 'La cédula es obligatoria';
      } else if (!/^\d{5,12}$/.test(m.cedula.replace(/\D/g, ''))) {
        newErrors[`${prefix}cedula`] = 'Número de cédula inválido (5 a 12 dígitos)';
      }
      if (!m.celular.trim()) {
        newErrors[`${prefix}celular`] = 'El número de celular es obligatorio';
      } else if (!/^\d{7,15}$/.test(m.celular.replace(/\D/g, ''))) {
        newErrors[`${prefix}celular`] = 'Número de celular inválido';
      }
      if (!m.contactoNombre.trim()) {
        newErrors[`${prefix}contactoNombre`] = 'El nombre del contacto es obligatorio';
      }
      if (!m.contactoCelular.trim()) {
        newErrors[`${prefix}contactoCelular`] = 'El número del contacto es obligatorio';
      }
    };

    if (step === 'integrante1') validateMemberIndex(0);
    if (step === 'integrante2') validateMemberIndex(1);
    if (step === 'integrante3') validateMemberIndex(2);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 'equipo') setCurrentStep('integrante1');
      else if (currentStep === 'integrante1') setCurrentStep('integrante2');
      else if (currentStep === 'integrante2') setCurrentStep('integrante3');
      else if (currentStep === 'integrante3') setCurrentStep('resumen');
    }
  };

  const prevStep = () => {
    if (currentStep === 'integrante1') setCurrentStep('equipo');
    else if (currentStep === 'integrante2') setCurrentStep('integrante1');
    else if (currentStep === 'integrante3') setCurrentStep('integrante2');
    else if (currentStep === 'resumen') setCurrentStep('integrante3');
  };

  // Submit registration form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 'resumen') {
      if (!validateStep(currentStep)) return;
      nextStep();
      return;
    }

    // Final submit
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  // Clipboard copy helper
  const handleCopyNequi = () => {
    navigator.clipboard.writeText('3222177207');
    setCopiedNequi(true);
    setTimeout(() => setCopiedNequi(false), 3000);
  };

  // Generate dynamic WhatsApp link
  const getWhatsAppLink = () => {
    const baseText = `¡Hola Guerreros Gym! 👋 Acabamos de inscribir a nuestro equipo "${teamName}" al RETO GUERREROS GYM 🏋️‍♂️🏆.\n\nIntegrantes:\n1. ${members[0].nombre} (Líder)\n2. ${members[1].nombre}\n3. ${members[2].nombre}\n\nAdjuntamos el comprobante del pago por valor de $120.000 COP de la inscripción. ¡Listos para dar el 100%! 🔥`;
    const encodedText = encodeURIComponent(baseText);
    return `https://wa.me/573222177207?text=${encodedText}`;
  };

  return (
    <div className="event-page-wrapper">
      {/* Dynamic Navigation Header */}
      <header className="event-header">
        <div className="header-inner">
          <div className="event-logo">
            <img src="/Guerreros Logo.jpeg" alt="Guerreros Gym Logo" className="header-logo-img" />
            <span className="gold-text-logo">GUERREROS <span className="white-text">GYM</span></span>
          </div>
          <nav className="event-nav">
            <a href="/" className="nav-item-link back-home-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-arrow">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              INICIO
            </a>
            <a href="#desafio" onClick={() => setActiveNav('desafio')} className={`nav-item-link ${activeNav === 'desafio' ? 'active' : ''}`}>EL DESAFÍO</a>
            <a href="#prioridades" onClick={() => setActiveNav('prioridades')} className={`nav-item-link ${activeNav === 'prioridades' ? 'active' : ''}`}>PILARES</a>
            <a href="#video-demo" onClick={() => setActiveNav('video-demo')} className={`nav-item-link ${activeNav === 'video-demo' ? 'active' : ''}`}>EJERCICIOS</a>
            <a href="#registro" onClick={() => { setActiveNav('registro'); document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' }); }} className="nav-cta-btn">INSCRIBIR EQUIPO</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="desafio" className="event-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-badge animate-pulse-slow">
            <span className="badge-dot"></span> ¡NO ES SOLO FUERZA, ES TRABAJO EN EQUIPO!
          </div>
          <h1 className="hero-main-title">
            RETO <br />
            <span className="gold-glow-text">GUERREROS</span> <br />
            <span className="white-glow-text">GYM</span>
          </h1>
          <p className="hero-subtitle-desc">
            Pon a prueba tu resistencia física, coordinación y mentalidad de acero. Reúne a tu equipo de 3 personas y compite por el premio mayor de <span className="gold-bold-span">$1'000.000 COP</span> en una prueba explosiva de solo 15 minutos.
          </p>

          <div className="hero-stats-row">
            <div className="hero-stat-card">
              <div className="stat-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">FECHA DEL RETO</span>
                <span className="stat-value">25 Y 26 DE JUNIO</span>
              </div>
            </div>

            <div className="hero-stat-card">
              <div className="stat-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">MODALIDAD</span>
                <span className="stat-value">EQUIPOS DE 3</span>
              </div>
            </div>

            <div className="hero-stat-card gold-border">
              <div className="stat-icon-wrapper gold-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dark-icon">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label gold-text">PREMIO GANADOR</span>
                <span className="stat-value gold-text">$1'000.000 COP</span>
              </div>
            </div>
          </div>

          <div className="hero-cta-group">
            <button onClick={() => document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })} className="hero-btn-primary">
              INSCRIBIR MI EQUIPO AHORA
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button onClick={() => document.getElementById('video-demo')?.scrollIntoView({ behavior: 'smooth' })} className="hero-btn-secondary">
              VER EJERCICIOS
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="prioridades" className="pillars-section">
        <div className="pillars-container">
          <div className="section-header-center">
            <div className="event-tag-gold">
              <span className="hero-tag-dot gold"></span> EN ESTE DESAFÍO
            </div>
            <h2 className="section-main-title">¿QUÉ EVALUAREMOS?</h2>
            <p className="section-subtitle-desc">
              No se trata solo de fuerza bruta. El equipo que domine estas cinco disciplinas se llevará la gloria y el millón de pesos.
            </p>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-outer">
                {/* Handshake/Team Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="pillar-card-title">TRABAJO EN EQUIPO</h3>
              <p className="pillar-card-desc">Sincronización, comunicación constante y apoyo mutuo. Ningún guerrero se queda atrás; el ritmo lo marca el equipo.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-outer">
                {/* Lightning/Energy Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3 className="pillar-card-title">ENERGÍA</h3>
              <p className="pillar-card-desc">Actitud arrolladora y máxima intensidad de principio a fin. Mantener el espíritu competitivo encendido en cada segundo.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-outer">
                {/* Spartan Helmet/Shield/Disciplina Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="pillar-card-title">DISCIPLINA</h3>
              <p className="pillar-card-desc">Ejecución técnica perfecta de cada ejercicio bajo fatiga extrema. Respetar los estándares y las repeticiones indicadas.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-outer">
                {/* Running Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h4M6 8h4M2 8h4M12 2v20M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <h3 className="pillar-card-title">RESISTENCIA</h3>
              <p className="pillar-card-desc">Capacidad pulmonar y muscular para resistir y acelerar cuando el cuerpo implora detenerse. Condición física real.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-outer">
                {/* Coordination/Team network Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="3"></circle>
                  <circle cx="5" cy="19" r="3"></circle>
                  <circle cx="19" cy="19" r="3"></circle>
                  <line x1="12" y1="8" x2="5" y2="16"></line>
                  <line x1="12" y1="8" x2="19" y2="16"></line>
                  <line x1="8" y1="19" x2="16" y2="19"></line>
                </svg>
              </div>
              <h3 className="pillar-card-title">COORDINACIÓN</h3>
              <p className="pillar-card-desc">Transiciones ágiles entre integrantes y precisión al alternar roles. Cada movimiento debe fluir con sincronía perfecta.</p>
            </div>
          </div>

          {/* Grand Prize Card */}
          <div className="grand-prize-card">
            <div className="grand-prize-glow"></div>
            <div className="grand-prize-content">
              <div className="prize-badge-ribbon">🏆 PREMIO AL GANADOR</div>
              <div className="prize-trophy-wrapper">
                {/* Large Gold Trophy SVG */}
                <svg className="prize-trophy" viewBox="0 0 24 24" fill="none" stroke="#FFC72C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
                  <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z"></path>
                </svg>
              </div>
              <div className="prize-amount">$1'000.000 COP</div>
              <h4 className="prize-highlight-text">¡EN TAN SOLO 15 MINUTOS!</h4>
              <p className="prize-extra-desc">El equipo de 3 con la mayor cantidad de repeticiones y el menor tiempo acumulado se llevará un millón de pesos colombianos en efectivo al instante de terminar el certamen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demonstration Section */}
      <section id="video-demo" className="video-section">
        <div className="video-container">
          <div className="section-header-center">
            <div className="event-tag-gold">
              <span className="hero-tag-dot gold"></span> PREPÁRATE BIEN
            </div>
            <h2 className="section-main-title">DEMOSTRACIÓN DE EJERCICIOS</h2>
            <p className="section-subtitle-desc">
              Mira con atención la ejecución reglamentaria de cada uno de los movimientos del Reto. Evita penalizaciones y pule tu técnica con nuestros entrenadores oficiales.
            </p>
          </div>

          <div className="video-player-card" onClick={() => setShowVideoModal(true)}>
            <div className="video-poster-overlay">
              <div className="poster-gradient"></div>
              <div className="video-play-btn animate-bounce-slow">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="play-icon-svg">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <div className="poster-info-text">
                <h3>RETO GUERREROS GYM - EJERCICIOS OFICIALES</h3>
                <p>Presiona para ver el video explicativo paso a paso (Duración: 3:45)</p>
              </div>
            </div>
            {/* Dark background mimicking a sports gym gym ring */}
            <div className="video-mock-frame">
              <img src="/funcional.jpg" alt="Demostración de entrenamiento" className="video-mock-bg" />
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="registro" className="registration-section">
        <div className="registration-container">
          <div className="section-header-center">
            <div className="event-tag-gold">
              <span className="hero-tag-dot gold"></span> INSCRIPCIONES ABIERTAS
            </div>
            <h2 className="section-main-title">FORMULARIO DE INSCRIPCIÓN</h2>
            <p className="section-subtitle-desc">
              Costo de inscripción: <span className="gold-text">$40.000 COP por persona</span> ($120.000 COP total por equipo). Diligencia todos los campos con los datos oficiales de tus competidores.
            </p>
          </div>

          <div className="registration-grid">
            {/* Left Column: Form Details & Summary Card */}
            <div className="registration-left-card">
              <div className="registration-fee-box">
                <div className="fee-header">
                  <span>TARIFA ÚNICA DE COMPETENCIA</span>
                </div>
                <div className="fee-price-large">
                  <span className="currency">COP</span>
                  <span className="number">$120.000</span>
                  <span className="label">/ EQUIPO</span>
                </div>
                <div className="fee-breakdown">
                  <div className="breakdown-row">
                    <span>Inscripción Individual (x3)</span>
                    <span>$120.000 COP</span>
                  </div>
                  <div className="breakdown-row border-top-glow">
                    <span className="total-label">Total a Pagar</span>
                    <span className="total-val">$120.000 COP</span>
                  </div>
                </div>
              </div>

              <div className="registration-steps-progress">
                <div className="progress-title">PASOS DEL REGISTRO</div>
                <div className="steps-list">
                  <div className={`step-progress-item ${currentStep === 'equipo' ? 'active' : ''} ${teamName ? 'completed' : ''}`} onClick={() => teamName && setCurrentStep('equipo')}>
                    <span className="step-num">1</span>
                    <span className="step-text">Nombre del Equipo</span>
                  </div>
                  <div className={`step-progress-item ${currentStep === 'integrante1' ? 'active' : ''} ${members[0].nombre ? 'completed' : ''}`} onClick={() => teamName && setCurrentStep('integrante1')}>
                    <span className="step-num">2</span>
                    <span className="step-text">Integrante 1 (Líder)</span>
                  </div>
                  <div className={`step-progress-item ${currentStep === 'integrante2' ? 'active' : ''} ${members[1].nombre ? 'completed' : ''}`} onClick={() => teamName && members[0].nombre && setCurrentStep('integrante2')}>
                    <span className="step-num">3</span>
                    <span className="step-text">Integrante 2</span>
                  </div>
                  <div className={`step-progress-item ${currentStep === 'integrante3' ? 'active' : ''} ${members[2].nombre ? 'completed' : ''}`} onClick={() => teamName && members[0].nombre && members[1].nombre && setCurrentStep('integrante3')}>
                    <span className="step-num">4</span>
                    <span className="step-text">Integrante 3</span>
                  </div>
                  <div className={`step-progress-item ${currentStep === 'resumen' ? 'active' : ''}`} onClick={() => teamName && members[0].nombre && members[1].nombre && members[2].nombre && setCurrentStep('resumen')}>
                    <span className="step-num">5</span>
                    <span className="step-text">Resumen de Registro</span>
                  </div>
                </div>
              </div>

              <div className="help-box-contact">
                <h4>¿TIENES DUDAS O INCONVENIENTES?</h4>
                <p>Escríbenos directamente o llámanos para asistirte en tu registro inmediato.</p>
                <div className="contact-links-small">
                  <a href="tel:3222177207" className="contact-small-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    322 217 7207
                  </a>
                  <a href="https://instagram.com/guerrerosgymcucuta" target="_blank" rel="noopener noreferrer" className="contact-small-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    @guerrerosgymcucuta
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Active Step Interactive Form */}
            <div className="registration-right-form">
              <form onSubmit={handleSubmit} className="form-card-inner">
                {currentStep === 'equipo' && (
                  <div className="form-step-container fade-in">
                    <h3 className="step-title">Nombre del Equipo</h3>
                    <p className="step-description">Elige un nombre de equipo único, intimidante y de auténticos guerreros.</p>
                    
                    <div className="form-group-custom">
                      <label htmlFor="teamName" className="input-label-gold">NOMBRE DEL EQUIPO *</label>
                      <input
                        type="text"
                        id="teamName"
                        value={teamName}
                        onChange={(e) => {
                          setTeamName(e.target.value);
                          if (errors.teamName) {
                            const newErrors = { ...errors };
                            delete newErrors.teamName;
                            setErrors(newErrors);
                          }
                        }}
                        className={`input-field-premium ${errors.teamName ? 'input-error' : ''}`}
                        placeholder="Ej. Los Inquebrantables, Alpha Team, etc."
                        required
                      />
                      {errors.teamName && <span className="error-message-text">{errors.teamName}</span>}
                    </div>

                    <div className="form-navigation-row">
                      <span></span> {/* Placeholder alignment */}
                      <button type="button" onClick={nextStep} className="btn-next-step">
                        CONFIGURAR LÍDER
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Member 1 (Leader), Member 2, Member 3 Forms */}
                {['integrante1', 'integrante2', 'integrante3'].includes(currentStep) && (() => {
                  const index = currentStep === 'integrante1' ? 0 : currentStep === 'integrante2' ? 1 : 2;
                  const member = members[index];
                  const prefix = `member_${index}_`;
                  const memberRole = index === 0 ? 'INTEGRANTE 1 (LÍDER DEL EQUIPO)' : `INTEGRANTE ${index + 1}`;

                  return (
                    <div className="form-step-container fade-in" key={currentStep}>
                      <h3 className="step-title">{memberRole}</h3>
                      <p className="step-description">Diligencia todos los datos obligatorios para registrar legalmente al atleta.</p>
                      
                      <div className="form-grid-two-cols">
                        <div className="form-group-custom">
                          <label className="input-label-gold">NOMBRES COMPLETOS *</label>
                          <input
                            type="text"
                            value={member.nombre}
                            onChange={(e) => handleMemberChange(index, 'nombre', e.target.value)}
                            className={`input-field-premium ${errors[`${prefix}nombre`] ? 'input-error' : ''}`}
                            placeholder="Nombre completo del competidor"
                            required
                          />
                          {errors[`${prefix}nombre`] && <span className="error-message-text">{errors[`${prefix}nombre`]}</span>}
                        </div>

                        <div className="form-group-custom">
                          <label className="input-label-gold">CORREO ELECTRÓNICO *</label>
                          <input
                            type="email"
                            value={member.correo}
                            onChange={(e) => handleMemberChange(index, 'correo', e.target.value)}
                            className={`input-field-premium ${errors[`${prefix}correo`] ? 'input-error' : ''}`}
                            placeholder="correo@ejemplo.com"
                            required
                          />
                          {errors[`${prefix}correo`] && <span className="error-message-text">{errors[`${prefix}correo`]}</span>}
                        </div>

                        <div className="form-group-custom">
                          <label className="input-label-gold">NÚMERO DE CÉDULA *</label>
                          <input
                            type="text"
                            value={member.cedula}
                            onChange={(e) => handleMemberChange(index, 'cedula', e.target.value)}
                            className={`input-field-premium ${errors[`${prefix}cedula`] ? 'input-error' : ''}`}
                            placeholder="Documento de identidad"
                            required
                          />
                          {errors[`${prefix}cedula`] && <span className="error-message-text">{errors[`${prefix}cedula`]}</span>}
                        </div>

                        <div className="form-group-custom">
                          <label className="input-label-gold">NÚMERO DE CELULAR *</label>
                          <input
                            type="tel"
                            value={member.celular}
                            onChange={(e) => handleMemberChange(index, 'celular', e.target.value)}
                            className={`input-field-premium ${errors[`${prefix}celular`] ? 'input-error' : ''}`}
                            placeholder="Teléfono móvil de contacto"
                            required
                          />
                          {errors[`${prefix}celular`] && <span className="error-message-text">{errors[`${prefix}celular`]}</span>}
                        </div>

                        <div className="form-group-custom">
                          <label className="input-label-gold">TIPO DE SANGRE *</label>
                          <select
                            value={member.tipoSangre}
                            onChange={(e) => handleMemberChange(index, 'tipoSangre', e.target.value)}
                            className="input-field-premium dropdown-select"
                          >
                            <option value="O+">O Positivo (O+)</option>
                            <option value="O-">O Negativo (O-)</option>
                            <option value="A+">A Positivo (A+)</option>
                            <option value="A-">A Negativo (A-)</option>
                            <option value="B+">B Positivo (B+)</option>
                            <option value="B-">B Negativo (B-)</option>
                            <option value="AB+">AB Positivo (AB+)</option>
                            <option value="AB-">AB Negativo (AB-)</option>
                          </select>
                        </div>

                        <div className="form-group-custom">
                          <label className="input-label-gold">GÉNERO *</label>
                          <select
                            value={member.genero}
                            onChange={(e) => handleMemberChange(index, 'genero', e.target.value)}
                            className="input-field-premium dropdown-select"
                          >
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro / Prefiero no decir</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-emergency-section">
                        <h4 className="emergency-title-small">📞 Contacto de Emergencia</h4>
                        <div className="form-grid-two-cols m-top-none">
                          <div className="form-group-custom">
                            <label className="input-label-gold">NOMBRE DE CONTACTO *</label>
                            <input
                              type="text"
                              value={member.contactoNombre}
                              onChange={(e) => handleMemberChange(index, 'contactoNombre', e.target.value)}
                              className={`input-field-premium ${errors[`${prefix}contactoNombre`] ? 'input-error' : ''}`}
                              placeholder="Nombre del familiar responsable"
                              required
                            />
                            {errors[`${prefix}contactoNombre`] && <span className="error-message-text">{errors[`${prefix}contactoNombre`]}</span>}
                          </div>

                          <div className="form-group-custom">
                            <label className="input-label-gold">TELÉFONO DE CONTACTO *</label>
                            <input
                              type="tel"
                              value={member.contactoCelular}
                              onChange={(e) => handleMemberChange(index, 'contactoCelular', e.target.value)}
                              className={`input-field-premium ${errors[`${prefix}contactoCelular`] ? 'input-error' : ''}`}
                              placeholder="Celular de emergencia"
                              required
                            />
                            {errors[`${prefix}contactoCelular`] && <span className="error-message-text">{errors[`${prefix}contactoCelular`]}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="form-navigation-row">
                        <button type="button" onClick={prevStep} className="btn-prev-step">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                          </svg>
                          REGRESAR
                        </button>
                        <button type="button" onClick={nextStep} className="btn-next-step">
                          {index === 2 ? 'VER RESUMEN' : `CONFIGURAR INTEGRANTE ${index + 2}`}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {currentStep === 'resumen' && (
                  <div className="form-step-container fade-in">
                    <h3 className="step-title">Resumen de Inscripción</h3>
                    <p className="step-description">Verifica detalladamente la información del equipo y de los competidores antes de proceder con el registro definitivo.</p>

                    <div className="summary-blocks-container">
                      <div className="summary-team-block">
                        <span className="summary-label">EQUIPO COMPETIDOR</span>
                        <span className="summary-team-value">{teamName}</span>
                      </div>

                      <div className="summary-members-grid">
                        {members.map((m, idx) => (
                          <div className="member-summary-card" key={idx}>
                            <div className="member-summary-header">
                              <span>INTEGRANTE {idx + 1} {idx === 0 ? '(LÍDER)' : ''}</span>
                              <span className="gender-tag">{m.genero}</span>
                            </div>
                            <div className="member-summary-body">
                              <p><strong>Nombres:</strong> {m.nombre}</p>
                              <p><strong>Cédula:</strong> {m.cedula}</p>
                              <p><strong>Celular:</strong> {m.celular}</p>
                              <p><strong>Correo:</strong> {m.correo}</p>
                              <p><strong>Tipo Sangre:</strong> {m.tipoSangre}</p>
                              <p className="border-t-muted"><strong>Emergencia:</strong> {m.contactoNombre} ({m.contactoCelular})</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-navigation-row">
                      <button type="button" onClick={prevStep} className="btn-prev-step">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="19" y1="12" x2="5" y2="12"></line>
                          <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        CORREGIR INTEGRANTES
                      </button>
                      <button type="submit" disabled={isSubmitting} className="btn-confirm-registration animate-pulse-glow">
                        {isSubmitting ? (
                          <span className="loading-spinner-row">
                            <span className="spinner-dot"></span>
                            PROCESANDO REGISTRO...
                          </span>
                        ) : (
                          <>
                            CONFIRMAR E INSCRIBIR EQUIPO
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal Explainer */}
      {showVideoModal && (
        <div className="video-modal-backdrop" onClick={() => setShowVideoModal(false)}>
          <div className="video-modal-content animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setShowVideoModal(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="video-iframe-wrapper">
              {/* Premium Simulated Video Player that plays interactive gym tutorial loops */}
              <div className="video-simulated-player">
                <div className="simulated-overlay">
                  <div className="simulated-brand">GUERREROS GYM</div>
                  <div className="simulated-status">MOCK VIDEO DEMONSTRATION</div>
                  <div className="simulated-exercise-info">
                    <h4>EJERCICIO 1: Kettlebell Swings (Ejecución oficial)</h4>
                    <p>Espalda recta, bisagra de cadera profunda, extensión total superior.</p>
                  </div>
                </div>
                <div className="simulated-controls">
                  <button className="simulated-play-pause">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  </button>
                  <div className="simulated-progress-bar">
                    <div className="progress-filled animate-progress-mock"></div>
                  </div>
                  <span className="simulated-time">01:14 / 03:45</span>
                </div>
                {/* Embed YouTube / Local video, since it is a placeholder we simulate the content beautifully */}
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&loop=1"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success & Payment Modal */}
      {showSuccessModal && (
        <div className="video-modal-backdrop">
          <div className="success-modal-content animate-zoom-in">
            <div className="success-icon-wrapper-modal animate-bounce-slow">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFC72C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            
            <h2 className="success-modal-title">¡REGISTRO EXITOSO!</h2>
            <p className="success-modal-subtitle">Tu equipo <strong>"{teamName}"</strong> ha sido pre-registrado en el Reto Guerreros Gym.</p>

            <div className="payment-instructions-card">
              <div className="p-header-gold">
                <span>⚠️ PARA COMPLETAR TU INSCRIPCIÓN:</span>
              </div>
              <div className="p-body-info">
                <p className="p-desc-text">Debes realizar la transferencia de **$120.000 COP** correspondiente a la inscripción de los 3 integrantes.</p>
                
                <div className="payment-options-row">
                  <div className="payment-card-method">
                    <span className="method-title">NEQUI / DAVIPLATA</span>
                    <span className="method-number">322 217 7207</span>
                    <span className="method-owner">Guerreros Gym Cúcuta</span>
                  </div>
                </div>

                <div className="payment-cta-utilities">
                  <button onClick={handleCopyNequi} className="btn-utility-copy">
                    {copiedNequi ? (
                      <>
                        ¡NÚMERO COPIADO!
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </>
                    ) : (
                      <>
                        COPIAR NÚMERO DE TELÉFONO
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="whatsapp-submission-instruction">
              <p>Una vez transferido, haz clic en el botón de abajo para enviar el **comprobante de pago por WhatsApp** al mismo número. Tras validarlo, tu inscripción quedará oficialmente **ACTIVA** y tu equipo asegurará su cupo en el cuadro de competencia.</p>
              
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp-send">
                {/* WhatsApp SVG Icon */}
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.579 2.019 14.1 1.002 11.993 1.002c-5.437 0-9.863 4.37-9.867 9.8-.001 1.83.49 3.619 1.42 5.178l-.927 3.39 3.491-.916zm12.357-6.883c-.27-.136-1.602-.79-1.85-.882-.25-.09-.432-.136-.613.136-.182.271-.703.882-.862 1.063-.16.182-.32.203-.59.067-.27-.136-1.14-.42-2.172-1.341-.803-.715-1.346-1.6-1.503-1.872-.158-.272-.017-.418.118-.553.122-.122.27-.315.405-.473.136-.157.182-.27.272-.451.09-.18.045-.338-.023-.473-.067-.136-.613-1.477-.84-2.02-.22-.53-.442-.458-.613-.467-.16-.008-.344-.01-.528-.01-.184 0-.485.07-.74.348-.253.28-.967.947-.967 2.308 0 1.362.99 2.678 1.13 2.858.136.18 1.95 2.977 4.72 4.17 1.336.574 2.215.753 2.995.666.784-.087 2.41-.986 2.748-1.938.337-.95.337-1.765.237-1.937-.1-.173-.27-.264-.54-.4z"/>
                </svg>
                ENVIAR COMPROBANTE POR WHATSAPP
              </a>
            </div>

            <button onClick={() => { setShowSuccessModal(false); window.location.href = '/'; }} className="btn-success-close">
              VOLVER AL INICIO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
