import React, { useState, useEffect, useRef } from 'react';
import './ConfirmationPage.css';
import {
  getInscripcion,
  borrarInscripcionPendiente,
  ApiError,
  type InscripcionEstado
} from '../lib/inscripcionesApi';

const formatCurrency = (val: any) => {
  if (val === undefined || val === null) return '120.000';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return num.toLocaleString('es-CO');
};

/* ============================================================
   ICONS
   ============================================================ */
const Icon = {
  Check: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Alert: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  ArrowLeft: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Refresh: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  ),
};

/* ============================================================
   STATUS GROUP MAPPER
   ============================================================ */
function getStatusGroup(estadoRaw: string): 'SUCCESS' | 'PENDING' | 'ERROR' {
  const status = String(estadoRaw).toUpperCase().trim();
  
  // Success states (WooCommerce completed/processing, Wompi APPROVED)
  if ([
    'COMPLETED', 'PROCESSING', 'PAGADA', 'PAGADO', 'APROBADA', 'APROBADO', 
    'SUCCESS', 'APPROVED', 'COMPLETO', 'PROCESANDO'
  ].includes(status)) {
    return 'SUCCESS';
  }
  
  // Pending states (WooCommerce pending/on-hold, Wompi PENDING)
  if ([
    'PENDING', 'PENDIENTE', 'PROCESSING_PAYMENT', 'ESPERANDO', 'VALIDATING', 
    'EN_ESPERA', 'PENDIENDO', 'ON-HOLD', 'ON_HOLD'
  ].includes(status)) {
    return 'PENDING';
  }
  
  // Error states (failed, cancelled, voided, etc.)
  return 'ERROR';
}

export default function ConfirmationPage() {
  const [inscripcionId, setInscripcionId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState<InscripcionEstado | null>(null);
  const [localPending, setLocalPending] = useState<any>(null);
  const [pollCount, setPollCount] = useState(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_POLLS = 12; // 12 polls * 4s = 48s max polling

  // 1. Obtener parámetros de la URL e inicializar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const insId = params.get('inscripcion_id');
    const txId = params.get('id'); // ID de transacción Wompi

    setInscripcionId(insId);
    setTransactionId(txId);

    if (!insId) {
      setError('No se proporcionó un identificador de inscripción válido en la URL.');
      setLoading(false);
      return;
    }

    // Comprobar si hay una inscripción local correspondiente en localStorage
    try {
      const raw = localStorage.getItem('guerreros_gym_inscripcion_pendiente');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (String(parsed.inscripcion_id) === String(insId)) {
          setLocalPending(parsed);
        }
      }
    } catch {
      // Ignorar fallas de localStorage
    }

    // Realizar primera consulta
    fetchStatus(insId);
  }, []);

  // 2. Controlar Polling cuando el estado es PENDING
  useEffect(() => {
    if (!estado || !inscripcionId) return;

    const group = getStatusGroup(estado.estado);

    if (group === 'PENDING' && pollCount < MAX_POLLS) {
      pollIntervalRef.current = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        fetchStatus(inscripcionId, true);
      }, 4000); // Polling cada 4 segundos
    }

    return () => {
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
      }
    };
  }, [estado, pollCount, inscripcionId]);

  // 3. Consultar API
  const fetchStatus = async (id: string, isPoll = false) => {
    if (!isPoll) setLoading(true);
    setError(null);

    try {
      const data = await getInscripcion(id);
      setEstado(data);

      const group = getStatusGroup(data.estado);

      // Si el pago es exitoso, limpiamos localStorage
      if (group === 'SUCCESS') {
        borrarInscripcionPendiente();
      }
    } catch (err) {
      console.error('Error verificando pago:', err);
      // No mostramos error invasivo durante polling
      if (!isPoll) {
        const msg = err instanceof ApiError
          ? err.message
          : 'No pudimos conectarnos al servidor para verificar tu estado de pago.';
        setError(msg);
      }
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  // Acción manual de verificar estado
  const handleManualCheck = () => {
    if (inscripcionId) {
      setPollCount(0); // Reiniciar intentos de polling
      fetchStatus(inscripcionId);
    }
  };

  /* ============================================================
     PANTALLAS SEGÚN ESTADO
     ============================================================ */

  // A. Cargando inicial
  if (loading) {
    return (
      <div className="cp-root">
        <div className="cp-glow-1" />
        <div className="cp-glow-2" />
        <div className="cp-card state-pending">
          <div className="cp-badge-wrap">
            <div className="cp-loading-spinner" />
            <div className="cp-badge">
              <span style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'cp-spin 0.8s linear infinite' }} />
            </div>
          </div>
          <h2 className="cp-team-name">Verificando Pago</h2>
          <div className="cp-status-text">Consultando</div>
          <p className="cp-message">
            Estamos conectándonos de forma segura con la pasarela de pagos para obtener el estado de tu transacción. Por favor, no cierres esta página.
          </p>
        </div>
      </div>
    );
  }

  // B. Error de consulta inicial
  if (error || !estado) {
    return (
      <div className="cp-root">
        <div className="cp-glow-1" />
        <div className="cp-glow-2" />
        <div className="cp-card state-error">
          <div className="cp-badge-wrap">
            <div className="cp-badge">
              <Icon.Alert style={{ width: 36, height: 36 }} />
            </div>
          </div>
          <h2 className="cp-team-name">Error de verificación</h2>
          <div className="cp-status-text">Error técnico</div>
          <p className="cp-message">
            {error || 'No pudimos verificar el estado de la inscripción en este momento.'}
          </p>

          <div className="cp-details">
            <div className="cp-detail-row">
              <span className="cp-detail-label">Inscripción ID</span>
              <span className="cp-detail-value">{inscripcionId || 'Desconocido'}</span>
            </div>
            {transactionId && (
              <div className="cp-detail-row">
                <span className="cp-detail-label">Transacción Wompi</span>
                <span className="cp-detail-value">{transactionId}</span>
              </div>
            )}
          </div>

          <div className="cp-actions">
            <button className="cp-btn-primary" onClick={handleManualCheck}>
              <Icon.Refresh style={{ width: 16, height: 16 }} /> Reintentar verificación
            </button>
            <a href="/reto" className="cp-btn-secondary">
              <Icon.ArrowLeft style={{ width: 16, height: 16 }} /> Volver al Reto
            </a>
          </div>
        </div>
      </div>
    );
  }

  const group = getStatusGroup(estado.estado);

  // C. Pago Exitoso (SUCCESS)
  if (group === 'SUCCESS') {
    return (
      <div className="cp-root">
        <div className="cp-glow-1" />
        <div className="cp-glow-2" />
        
        {/* CSS Confetti Effects */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
          {[...Array(20)].map((_, i) => {
            const left = Math.random() * 100;
            const size = Math.random() * 8 + 4;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 2;
            const colors = ['#083BF7', '#a020f0', '#5c7cff', '#ffffff'];
            const bg = colors[Math.floor(Math.random() * colors.length)];
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  background: bg,
                  opacity: 0.6,
                  boxShadow: `0 0 10px ${bg}`,
                  animation: `cp-fall ${duration}s linear infinite`,
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>

        <div className="cp-card state-success">
          <div className="cp-badge-wrap">
            <div className="cp-pulse-ring" />
            <div className="cp-badge">
              <Icon.Check style={{ width: 36, height: 36 }} />
            </div>
          </div>

          <h2 className="cp-team-name">¡Inscripción Exitosa!</h2>
          <div className="cp-status-text">Pago confirmado</div>
          
          <p className="cp-message">
            ¡Felicitaciones! El pago del equipo <strong>{estado.nombre_equipo}</strong> ha sido confirmado de manera exitosa. Su cupo para el evento está asegurado.
          </p>

          <div className="cp-details">
            <div className="cp-detail-row">
              <span className="cp-detail-label">Equipo</span>
              <span className="cp-detail-value highlight">{estado.nombre_equipo || 'Equipo'}</span>
            </div>
            <div className="cp-detail-row">
              <span className="cp-detail-label">Atletas inscritos</span>
              <span className="cp-detail-value">{(Number(estado.num_atletas) || 3)} integrantes</span>
            </div>
            <div className="cp-detail-row">
              <span className="cp-detail-label">Total pagado</span>
              <span className="cp-detail-value">${formatCurrency(estado.monto_total_cop)} COP</span>
            </div>
            <div className="cp-detail-row">
              <span className="cp-detail-label">Inscripción ID</span>
              <span className="cp-detail-value">#{estado.id ?? inscripcionId}</span>
            </div>
            {transactionId && (
              <div className="cp-detail-row">
                <span className="cp-detail-label">Ref. Transacción</span>
                <span className="cp-detail-value" style={{ fontSize: '12px' }}>{transactionId.split('-')[0]}...</span>
              </div>
            )}
          </div>

          <div className="cp-actions">
            <a href="/reto" className="cp-btn-primary">
              Volver a la página de inicio
            </a>
            <a
              href={`https://wa.me/573222177207?text=Hola%20Guerreros%20Gym!%20Acabo%20de%20inscribir%20con%20exito%20a%20mi%20equipo%20${encodeURIComponent(estado.nombre_equipo || 'Equipo')}%20(ID%20${estado.id ?? inscripcionId}).`}
              target="_blank"
              rel="noreferrer"
              className="cp-btn-secondary"
            >
              Escribir al WhatsApp oficial
            </a>
          </div>
        </div>

        {/* CSS Animation inject specifically for falling confetti */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes cp-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
          }
        ` }} />
      </div>
    );
  }

  // D. Pago Pendiente (PENDING)
  if (group === 'PENDING') {
    const isMaxPollsReached = pollCount >= MAX_POLLS;

    return (
      <div className="cp-root">
        <div className="cp-glow-1" />
        <div className="cp-glow-2" />
        <div className="cp-card state-pending">
          <div className="cp-badge-wrap">
            <div className="cp-loading-spinner" />
            <div className="cp-badge">
              <Icon.Refresh style={{ width: 28, height: 28, animation: 'cp-spin 4s linear infinite' }} />
            </div>
          </div>

          <h2 className="cp-team-name">Pago en proceso</h2>
          <div className="cp-status-text">Verificando en red</div>

          <p className="cp-message">
            Tu transacción está siendo procesada por tu banco o pasarela de pagos.
            {isMaxPollsReached 
              ? ' Esto puede tomar unos minutos más dependiendo del método utilizado (ej. PSE o Tarjeta de Crédito).' 
              : ' Estamos actualizando el estado de forma automática, por favor espera.'}
          </p>

          <div className="cp-details">
            <div className="cp-detail-row">
              <span className="cp-detail-label">Equipo</span>
              <span className="cp-detail-value">{estado.nombre_equipo || 'Equipo'}</span>
            </div>
            <div className="cp-detail-row">
              <span className="cp-detail-label">Estado actual</span>
              <span className="cp-detail-value" style={{ color: '#ffb300' }}>Pendiente</span>
            </div>
            <div className="cp-detail-row">
              <span className="cp-detail-label">Inscripción ID</span>
              <span className="cp-detail-value">#{estado.id ?? inscripcionId}</span>
            </div>
          </div>

          <div className="cp-actions">
            <button className="cp-btn-primary" onClick={handleManualCheck}>
              <Icon.Refresh style={{ width: 16, height: 16 }} /> Actualizar estado
            </button>
            <a
              href={`https://wa.me/573222177207?text=Hola%20Guerreros%20Gym!%20El%20pago%20de%20mi%20equipo%20${encodeURIComponent(estado.nombre_equipo || 'Equipo')}%20(ID%20${estado.id ?? inscripcionId})%20aparece%20como%20pendiente.%20Transaccion%3A%20${transactionId || 'Ninguna'}`}
              target="_blank"
              rel="noreferrer"
              className="cp-btn-secondary"
            >
              Ayuda por WhatsApp
            </a>
          </div>

          <a href="/reto" className="cp-btn-link">
            Volver a la página principal
          </a>
        </div>
      </div>
    );
  }

  // E. Pago Cancelado o Fallido (ERROR / DECLINED)
  const retryUrl = localPending?.checkout_url || '/reto';

  return (
    <div className="cp-root">
      <div className="cp-glow-1" />
      <div className="cp-glow-2" />
      <div className="cp-card state-error">
        <div className="cp-badge-wrap">
          <div className="cp-badge">
            <Icon.Alert style={{ width: 36, height: 36 }} />
          </div>
        </div>

        <h2 className="cp-team-name">Pago Rechazado</h2>
        <div className="cp-status-text">Transacción fallida</div>

        <p className="cp-message">
          Lo sentimos, la pasarela de pagos no pudo procesar tu transacción. El estado devuelto es: <strong>{String(estado.estado || 'error').toLowerCase()}</strong>. Ningún cargo ha sido confirmado.
        </p>

        <div className="cp-details">
          <div className="cp-detail-row">
            <span className="cp-detail-label">Equipo</span>
            <span className="cp-detail-value">{estado.nombre_equipo || 'Equipo'}</span>
          </div>
          <div className="cp-detail-row">
            <span className="cp-detail-label">Inscripción ID</span>
            <span className="cp-detail-value">#{estado.id ?? inscripcionId}</span>
          </div>
          {transactionId && (
            <div className="cp-detail-row">
              <span className="cp-detail-label">Ref. de Transacción</span>
              <span className="cp-detail-value" style={{ fontSize: '11px' }}>{transactionId}</span>
            </div>
          )}
        </div>

        <div className="cp-actions">
          <a href={retryUrl} className="cp-btn-primary">
            Volver a intentar pago
          </a>
          <a
            href={`https://wa.me/573222177207?text=Hola%20Guerreros%20Gym!%20El%20pago%20de%20mi%20equipo%20${encodeURIComponent(estado.nombre_equipo || 'Equipo')}%20(ID%20${estado.id ?? inscripcionId})%20fue%20rechazado.%20Ref%3A%20${transactionId || 'Ninguna'}`}
            target="_blank"
            rel="noreferrer"
            className="cp-btn-secondary"
          >
            Soporte por WhatsApp
          </a>
        </div>

        <a href="/reto" className="cp-btn-link">
          Volver a la página principal del evento
        </a>
      </div>
    </div>
  );
}
