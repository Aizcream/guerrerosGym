import React, { useState } from "react";
import "./Planes.css";

export default function Planes() {
  const [period, setPeriod] = useState("Mensual");

  const getIndividualPrice = () => {
    switch (period) {
      case "Trimestral":
        return { price: "$345.000", label: "/TRIMESTRE" };
      case "Semestral":
        return { price: "$600.000", label: "/SEMESTRE" };
      default:
        return { price: "$130.000", label: "/MES" };
    }
  };

  const currentIndividual = getIndividualPrice();

  return (
    <section className="planes-section" id="planes">
      <div className="planes-container">
        {/* Left: Info */}
        <div className="planes-info">
          <div className="planes-tag">
            <span className="hero-tag-dot"></span>
            PLANES
          </div>
          <h2 className="planes-title">
            EL PLAN QUE
            <br />
            SE ADAPTA A TI
          </h2>
          <p className="planes-desc">
            Elige el plan ideal para tu objetivo y tu estilo de vida.
            Entrenamiento personalizado, resultados reales.
          </p>

          <div className="period-toggle">
            <button
              className={`toggle-btn ${period === "Mensual" ? "active" : ""}`}
              onClick={() => setPeriod("Mensual")}
            >
              Mensual
            </button>
            <button
              className={`toggle-btn ${period === "Trimestral" ? "active" : ""}`}
              onClick={() => setPeriod("Trimestral")}
            >
              Trimestral
            </button>
            <button
              className={`toggle-btn ${period === "Semestral" ? "active" : ""}`}
              onClick={() => setPeriod("Semestral")}
            >
              Semestral
            </button>
          </div>
        </div>

        {/* Right: Cards */}
        <div className="planes-cards-wrapper">
          <div className="planes-cards">
            {/* Card 1: Individual */}
            <div className="plan-card">
              <div className="plan-header">
                <h3 className="plan-name">INDIVIDUAL</h3>
                <span className="plan-subtitle">1 PERSONA</span>
              </div>
              <div className="plan-price">
                <span className="price-number">{currentIndividual.price}</span>
                <span className="price-period">{currentIndividual.label}</span>
              </div>
              <ul className="plan-features">
                <li>Acceso a todas las zonas del gimnasio</li>
                <li>Clases grupales ilimitadas</li>
                <li>Evaluación física inicial</li>
                <li>Seguimiento de progreso</li>
              </ul>
              <div className="plan-footer">
                <button 
                  className="btn-plan outline"
                  onClick={() => window.location.href = `/mensualidad?plan=${period === "Semestral" ? "semestral" : period === "Trimestral" ? "trimestral" : "mensual"}`}
                >
                  ELEGIR PLAN
                </button>
              </div>
            </div>

            {/* Card 2: Personalizado (Popular) */}
            <div className="plan-card popular">
              <div className="popular-tag">MÁS POPULAR</div>
              <div className="plan-header">
                <h3 className="plan-name">PERSONALIZADO</h3>
                <span className="plan-subtitle">1 A 1</span>
              </div>
              <div className="plan-price">
                <span className="price-number">$350.000</span>
                <span className="price-period">/MES</span>
              </div>
              <ul className="plan-features">
                <li>Plan 100% personalizado</li>
                <li>3 sesiones por semana</li>
                <li>Evaluación y seguimiento</li>
                <li>Ajustes semanales</li>
                <li>Atención prioritaria</li>
              </ul>
              <div className="plan-footer">
                <button 
                  className="btn-plan solid"
                  onClick={() => window.location.href = "/mensualidad?plan=personalizado"}
                >
                  ELEGIR PLAN
                </button>
              </div>
            </div>

            {/* Card 3: Grupal / Familiar */}
            <div className="plan-card">
              <div className="plan-header">
                <h3 className="plan-name">GRUPAL Y FAMILIAR</h3>
                <span className="plan-subtitle">DESDE 2 PERSONAS</span>
              </div>
              <div className="discount-list">
                <div className="discount-item">
                  <span className="discount-qty">PLAN DÚO</span>
                  <span className="discount-pct">$120.000 c/u</span>
                </div>
                <div className="discount-item border-y">
                  <span className="discount-qty">PLAN TRÍO</span>
                  <span className="discount-pct">$110.000 c/u</span>
                </div>
                <div className="discount-item">
                  <span className="discount-qty">PLAN FAMILIAR</span>
                  <span className="discount-pct">$100.000 c/u</span>
                </div>
              </div>
              <p className="card-hint">
                Entrena en compañía y obtén los mejores descuentos.
              </p>
              <div className="plan-footer flex-grow">
                <button 
                  className="btn-plan outline"
                  onClick={() => window.location.href = "/mensualidad?plan=familiar"}
                >
                  VER OPCIONES
                </button>
              </div>
            </div>
          </div>

          {/* Estudiantil Banner */}
          <div className="estudiantil-banner">
            <div className="est-info">
              <h4>¿ERES ESTUDIANTE?</h4>
              <p>
                Presenta tu carné y obtén tu mensualidad por solo{" "}
                <strong>$80.000 /MES</strong>
              </p>
            </div>
            <button 
              className="btn-plan outline est-btn"
              onClick={() => window.location.href = "/mensualidad?plan=estudiante"}
            >
              VER CONDICIONES
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
