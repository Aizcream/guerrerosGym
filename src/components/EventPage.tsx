import React, { useState, useEffect, useMemo } from 'react';
import './EventPage.css';
import {
  postInscripcion,
  getInscripcion,
  buildPayload,
  ApiError,
  guardarInscripcion,
  leerInscripcionPendiente,
  borrarInscripcionPendiente,
  type InscripcionCreada,
  type InscripcionEstado,
  type InscripcionGuardada,
} from '../lib/inscripcionesApi';

/* ============================================================
   ICONS (from icons.jsx)
   ============================================================ */
const Icon = {
  Calendar: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <rect x="3" y="5" width="18" height="16" /><path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  ),
  Users: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <circle cx="9" cy="8" r="3.5" /><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6" />
      <circle cx="17" cy="6" r="2.5" /><path d="M16 13c3 0 6 2 6 5" />
    </svg>
  ),
  Clock: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" />
    </svg>
  ),
  Play: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}><path d="M5 3l16 9-16 9z" /></svg>
  ),
  Check: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...p}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  ),
  Alert: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18.5v.5" />
    </svg>
  ),
  Chev: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  Instagram: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  Whatsapp: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M3 21l1.5-5A8.5 8.5 0 1112 20.5L3 21z" />
      <path d="M8.5 9c0 4 2.5 6.5 6.5 6.5l1.5-1.5-2-1-1 1c-1 0-2.5-1.5-2.5-2.5l1-1-1-2L9.5 8c-.5 0-1 .5-1 1z" fill="currentColor" />
    </svg>
  ),
  Arrow: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
};

/* ============================================================
   TROPHY & CROWN SVGs (from app.jsx)
   ============================================================ */
function Trophy({ color = 'currentColor', size = 92 }) {
  return (
    <svg viewBox="0 0 80 100" width={size} height={size} fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12 H58 V36 C58 50 50 58 40 58 C30 58 22 50 22 36 Z" />
      <path d="M22 18 H12 C12 26 16 32 22 34" />
      <path d="M58 18 H68 C68 26 64 32 58 34" />
      <path d="M34 58 V68 H46 V58" />
      <rect x="26" y="68" width="28" height="6" rx="1" />
      <rect x="22" y="74" width="36" height="6" rx="1" />
    </svg>
  );
}

function Crown({ color = 'currentColor', size = 36 }) {
  return (
    <svg viewBox="0 0 60 40" width={size} height={size} fill={color}>
      <path d="M5 32 L10 12 L20 22 L30 6 L40 22 L50 12 L55 32 Z" />
      <rect x="5" y="32" width="50" height="5" rx="1" />
    </svg>
  );
}

/* ============================================================
   COUNTDOWN HOOK
   ============================================================ */
const EVENT_DATE = new Date('2026-06-25T08:00:00-05:00');

function useCountdown(target: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

/* ============================================================
   IMAGES
   Hero + format cards → Unsplash (original Claude Design URLs)
   Form side + video   → uploaded local files
   ============================================================ */
const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const IMG = {
  // "Atleta posando" — hombre flexionando, vista desde abajo
  hero: u('photo-1532029837206-abbe2b7620e3', 2000),
  fmtDate: u('photo-1571019613454-1cb2f99b2d8b', 900),
  fmtTeam: u('photo-1534258936925-c58bed479fcb', 900),
  fmtTime: u('photo-1518611012118-696072aa579a', 900),
  fmtIntense: u('photo-1599058917212-d750089bc07e', 900),
  video: '/reto-upload-video.png',
  formSide: '/reto-upload-form.png', // chica sosteniendo la barra
  logo: '/logo-reto.png',
};

/* ============================================================
   FORM TYPES & HELPERS (from form.jsx)
   ============================================================ */
interface MemberData {
  nombres: string;
  correo: string;
  cedula: string;
  celular: string;
  sangre: string;
  emergencia_nombre: string;
  emergencia_tel: string;
  genero: string;
}

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const GENDERS = [
  { id: 'M', label: 'Hombre' },
  { id: 'F', label: 'Mujer' },
  { id: 'X', label: 'Otro' },
];

const emptyMember = (): MemberData => ({
  nombres: '', correo: '', cedula: '', celular: '',
  sangre: '', emergencia_nombre: '', emergencia_tel: '', genero: '',
});

function validateMember(m: MemberData) {
  const e: Record<string, string> = {};
  if (!m.nombres.trim()) e.nombres = 'Requerido';
  if (!m.correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.correo = 'Correo inválido';
  if (!m.cedula.match(/^\d{6,12}$/)) e.cedula = 'Número inválido';
  if (!m.celular.match(/^\d{10}$/)) e.celular = '10 dígitos';
  if (!m.sangre) e.sangre = 'Requerido';
  if (!m.emergencia_nombre.trim()) e.emergencia_nombre = 'Requerido';
  if (!m.emergencia_tel.match(/^\d{7,10}$/)) e.emergencia_tel = 'Inválido';
  if (!m.genero) e.genero = 'Requerido';
  return e;
}

/* ---- Field wrapper ---- */
interface FieldProps {
  label?: string;
  req?: boolean;
  error?: string | null;
  children: React.ReactNode;
  full?: boolean;
}
function Field({ label, req, error, children, full }: FieldProps) {
  return (
    <div className={'field' + (error ? ' error' : '') + (full ? ' field-full' : '')}>
      {label && <label>{label}{req && <span className="req">*</span>}</label>}
      {children}
      {error && <span className="err">{error}</span>}
    </div>
  );
}

/* ---- Member accordion card ---- */
interface MemberCardProps {
  idx: number;
  data: MemberData;
  errors: Record<string, string>;
  onChange: (data: MemberData) => void;
  open: boolean;
  onToggle: () => void;
  complete: boolean;
}
function MemberCard({ idx, data, errors, onChange, open, onToggle, complete }: MemberCardProps) {
  const set = (k: keyof MemberData, v: string) => onChange({ ...data, [k]: v });
  return (
    <div className={'team-card' + (open ? ' open' : '') + (complete ? ' complete' : '')}>
      <div className="team-header" onClick={onToggle}>
        <div className="num">{String(idx + 1).padStart(2, '0')}</div>
        <div className="title">
          <div className="t">{data.nombres ? data.nombres : `Atleta ${idx + 1}`}</div>
          <div className="s">{complete ? 'Datos completos' : 'Toca para diligenciar'}</div>
        </div>
        <div className="status">
          {complete
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon.Check style={{ width: 14, height: 14 }} /> Ok
            </span>
            : 'Pendiente'}
        </div>
        <Icon.Chev className="chev" style={{ width: 18, height: 18 }} />
      </div>
      <div className="team-body">
        <div className="team-body-inner">
          <div className="team-body-pad">
            <div className="field-group">
              <Field label="Nombres y apellidos" req error={errors.nombres}>
                <input value={data.nombres} onChange={e => set('nombres', e.target.value)} placeholder="Ej. María González" />
              </Field>
              <Field label="Cédula" req error={errors.cedula}>
                <input value={data.cedula} onChange={e => set('cedula', e.target.value.replace(/\D/g, '').slice(0, 12))} inputMode="numeric" placeholder="10000000" />
              </Field>
            </div>
            <div className="field-group">
              <Field label="Correo electrónico" req error={errors.correo}>
                <input value={data.correo} onChange={e => set('correo', e.target.value)} type="email" placeholder="nombre@correo.com" />
              </Field>
              <Field label="Celular" req error={errors.celular}>
                <input value={data.celular} onChange={e => set('celular', e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="3001234567" />
              </Field>
            </div>
            <div className="field-group">
              <Field label="Tipo de sangre" req error={errors.sangre}>
                <select value={data.sangre} onChange={e => set('sangre', e.target.value)}>
                  <option value="">Selecciona</option>
                  {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <div className="field">
                <label>Género<span className="req">*</span></label>
                <div className="chip-row" style={{ paddingTop: 8 }}>
                  {GENDERS.map(g => (
                    <button
                      type="button"
                      key={g.id}
                      className={'chip' + (data.genero === g.id ? ' on' : '')}
                      onClick={() => set('genero', g.id)}
                    >{g.label}</button>
                  ))}
                </div>
                {errors.genero && <span className="err">{errors.genero}</span>}
              </div>
            </div>
            <div className="field-group">
              <Field label="Contacto de emergencia · nombre" req error={errors.emergencia_nombre}>
                <input value={data.emergencia_nombre} onChange={e => set('emergencia_nombre', e.target.value)} placeholder="Ej. Carlos Pérez" />
              </Field>
              <Field label="Contacto de emergencia · teléfono" req error={errors.emergencia_tel}>
                <input value={data.emergencia_tel} onChange={e => set('emergencia_tel', e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="3001234567" />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   REGISTRATION FORM — con integración real al API
   ============================================================ */

/** Pantalla de estado de pago — se muestra cuando Wompi redirige de vuelta */
function PaymentStatus({ inscripcionId }: { inscripcionId: string }) {
  const [estado, setEstado] = useState<InscripcionEstado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInscripcion(inscripcionId)
      .then((data) => {
        setEstado(data);
        // Limpiar localStorage cuando el pago queda confirmado
        if (data.estado === 'completed' || data.estado === 'processing') {
          borrarInscripcionPendiente();
        }
      })
      .catch((err) => {
        const msg = err instanceof ApiError
          ? err.message
          : 'No se pudo verificar el estado del pago.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [inscripcionId]);

  if (loading) {
    return (
      <div className="success" style={{ textAlign: 'center' }}>
        <div className="success-mark" style={{ borderColor: 'var(--ink-dim)', color: 'var(--ink-dim)' }}>
          <span style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'ep-spin 0.8s linear infinite' }} />
        </div>
        <h3>Verificando tu pago…</h3>
        <p>Consultando el estado de la inscripción, por favor espera.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success" style={{ borderColor: 'var(--warm)' }}>
        <div className="success-mark" style={{ borderColor: 'var(--warm)', color: 'var(--warm)' }}>
          <Icon.Alert style={{ width: 32, height: 32 }} />
        </div>
        <h3>No pudimos verificar el pago</h3>
        <p>{error}</p>
        <a href="https://wa.me/573222177207" target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          Contactar por WhatsApp <Icon.Arrow style={{ width: 18, height: 18 }} />
        </a>
      </div>
    );
  }

  const pagado = estado?.estado === 'completed' || estado?.estado === 'processing';

  return (
    <div className="success">
      <div className="success-mark" style={pagado ? {} : { borderColor: 'var(--warm)', color: 'var(--warm)' }}>
        {pagado
          ? <Icon.Check style={{ width: 32, height: 32 }} />
          : <Icon.Alert style={{ width: 32, height: 32 }} />}
      </div>
      <h3>
        {pagado
          ? `¡Equipo ${estado?.nombre_equipo} confirmado!`
          : `Pago pendiente — ${estado?.nombre_equipo}`}
      </h3>
      <p>
        {pagado
          ? `Tu inscripción está confirmada. Nos vemos el 25 y 26 de junio en Guerreros Gym. ¡A entrenar!`
          : `Tu pago aún no ha sido procesado. Si ya pagaste, espera unos minutos y recarga la página. Si el problema persiste, contáctanos.`}
      </p>
      {!pagado && (
        <a href="https://wa.me/573222177207" target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          Contactar por WhatsApp <Icon.Arrow style={{ width: 18, height: 18 }} />
        </a>
      )}
    </div>
  );
}

/* ============================================================
   PENDING PAYMENT — recuperación de pago pendiente o rechazado
   ============================================================ */
function tiempoAtras(ms: number): string {
  const diff = Date.now() - ms;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `hace ${h}h ${m > 0 ? ` ${m}m` : ''}`;
  if (m > 0) return `hace ${m} min`;
  return 'hace un momento';
}

function PendingPayment({
  data,
  onDismiss,
}: {
  data: InscripcionGuardada;
  onDismiss: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<InscripcionEstado | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const handleCheck = async () => {
    setChecking(true);
    setCheckError(null);
    try {
      const estado = await getInscripcion(data.inscripcion_id);
      setCheckResult(estado);
      if (estado.estado === 'completed' || estado.estado === 'processing') {
        borrarInscripcionPendiente();
        // Breve pausa para que el usuario vea la confirmación antes de limpiar
        setTimeout(onDismiss, 3500);
      }
    } catch (err) {
      setCheckError(
        err instanceof ApiError ? err.message : 'No se pudo verificar el estado.'
      );
    } finally {
      setChecking(false);
    }
  };

  // Pago confirmado tras verificar
  if (checkResult && (checkResult.estado === 'completed' || checkResult.estado === 'processing')) {
    return (
      <div className="success">
        <div className="success-mark"><Icon.Check style={{ width: 32, height: 32 }} /></div>
        <h3>¡Pago confirmado, equipo {checkResult.nombre_equipo}!</h3>
        <p>Tu inscripción está activa. Nos vemos el 25 y 26 de junio. ¡A entrenar!</p>
      </div>
    );
  }

  return (
    <div className="pending-payment">
      {/* Badge de estado */}
      <div className="pending-badge">
        <Icon.Alert style={{ width: 14, height: 14 }} />
        Pago pendiente
      </div>

      {/* Info del equipo */}
      <div className="pending-team">{data.nombre_equipo}</div>
      <div className="pending-meta">
        ${data.total_cop.toLocaleString('es-CO')} COP · {data.num_atletas} atletas
        <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
        Registrado {tiempoAtras(data.guardado_en)}
      </div>

      <p style={{ color: 'var(--ink-dim)', fontSize: 15, lineHeight: 1.6, marginBottom: 0 }}>
        Tu equipo quedó registrado pero el pago no fue completado.
        Puedes reintentar el pago, verificar si ya fue procesado,
        o comenzar una nueva inscripción.
      </p>

      {/* Error de verificación */}
      {checkError && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(229,53,53,0.06)', border: '1px solid rgba(229,53,53,0.3)', borderRadius: 10, fontSize: 14, color: '#e03535' }}>
          {checkError}
        </div>
      )}

      {/* Estado después de verificar — pago aún pendiente */}
      {checkResult && !['completed','processing'].includes(checkResult.estado) && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'color-mix(in srgb, var(--warm) 8%, var(--bg-3))', border: '1px solid color-mix(in srgb, var(--warm) 30%, var(--line-2))', borderRadius: 10, fontSize: 14, color: 'var(--ink-dim)' }}>
          Estado actual: <strong style={{ color: 'var(--warm)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{checkResult.estado}</strong> — si acabas de pagar, espera unos minutos y vuelve a verificar.
        </div>
      )}

      {/* Acciones */}
      <div className="pending-actions">
        <button
          className="btn-primary"
          onClick={() => {
            console.log('--- REINTENTO DE PAGO ---');
            console.log('checkout_url guardada en LS:', data.checkout_url);
            window.location.href = data.checkout_url;
          }}
          style={{ textDecoration: 'none' }}
        >
          Reintentar pago <Icon.Arrow style={{ width: 16, height: 16 }} />
        </button>

        <button
          className="btn-secondary"
          onClick={handleCheck}
          disabled={checking}
        >
          {checking
            ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'ep-spin 0.8s linear infinite', marginRight: 6 }} />Verificando…</>
            : <>Verificar estado</>}
        </button>

        <button
          className="btn-discard"
          onClick={() => { borrarInscripcionPendiente(); onDismiss(); }}
        >
          Empezar de nuevo
        </button>
      </div>
    </div>
  );
}

function RegistrationForm() {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<MemberData[]>([emptyMember(), emptyMember(), emptyMember()]);
  const [openIdx, setOpenIdx] = useState<number>(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [inscripcionCreada, setInscripcionCreada] = useState<InscripcionCreada | null>(null);
  const [wompiReturnId, setWompiReturnId] = useState<string | null>(null);
  // Inscripción guardada en localStorage (pago pendiente o rechazado)
  const [pendiente, setPendiente] = useState<InscripcionGuardada | null>(null);

  // ── Inicialización: retorno de Wompi + localStorage ────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('inscripcion_id');
    if (id) {
      // Wompi redirigió de vuelta → PaymentStatus se encarga
      setWompiReturnId(id);
    } else {
      // Sin retorno de Wompi → buscar inscripción guardada en LS
      const guardada = leerInscripcionPendiente();
      if (guardada) setPendiente(guardada);
    }
  }, []);


  // ── Validación del formulario ──────────────────────────────
  const memberErrors = useMemo(() => members.map(validateMember), [members]);
  const memberComplete = memberErrors.map(e => Object.keys(e).length === 0);
  const genders = members.map(m => m.genero).filter(Boolean);
  const genderOK = genders.includes('M') && genders.includes('F');
  const teamNameError = submitAttempted && !teamName.trim();
  const allOK = teamName.trim() && memberComplete.every(Boolean) && genderOK;

  // ── Submit → POST → guardar en LS → redirect ──────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setApiError(null);

    if (!allOK) {
      const firstBad = memberComplete.findIndex(c => !c);
      if (firstBad >= 0) setOpenIdx(firstBad);
      return;
    }

    setApiLoading(true);
    try {
      const payload = buildPayload(teamName, members);
      const result = await postInscripcion(payload);
      // Guardar ANTES de redirigir para poder recuperar si el pago falla
      guardarInscripcion(result, teamName);
      console.log('--- DIAGNÓSTICO DE REDIRECCIÓN A WOMPI ---');
      console.log('Respuesta completa de la API:', result);
      console.log('checkout_url recibida:', result.checkout_url);
      setInscripcionCreada(result);
      window.location.href = result.checkout_url;
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.message
        : 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
      setApiError(msg);
    } finally {
      setApiLoading(false);
    }
  };

  // ── Pantallas de estado ────────────────────────────────────

  // Wompi redirigió de vuelta → consultar GET
  if (wompiReturnId) {
    return <PaymentStatus inscripcionId={wompiReturnId} />;
  }

  // Hay una inscripción pendiente en localStorage → mostrar recuperación
  if (pendiente) {
    return <PendingPayment data={pendiente} onDismiss={() => setPendiente(null)} />;
  }

  // POST exitoso — el redirect a Wompi ya se lanzó,
  // mostramos pantalla de espera mientras el navegador navega
  if (inscripcionCreada) {
    return (
      <div className="success" style={{ textAlign: 'center' }}>
        <div className="success-mark">
          <span style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'ep-spin 0.8s linear infinite' }} />
        </div>
        <h3>¡Equipo {teamName} registrado!</h3>
        <p>Redirigiendo a la pasarela de pago…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-main">
      {/* Team name card */}
      <div className="team-card open" style={{ borderColor: teamName.trim() ? 'var(--ok)' : 'var(--line-2)' }}>
        <div className="team-header" style={{ cursor: 'default' }}>
          <div className="num" style={{
            borderColor: teamName.trim() ? 'var(--ok)' : 'var(--accent)',
            color: teamName.trim() ? 'var(--ok)' : 'var(--accent)',
          }}>★</div>
          <div className="title">
            <div className="t">Nombre del equipo</div>
            <div className="s">Elige un nombre con carácter — aparecerá en la competencia</div>
          </div>
        </div>
        <div className="team-body" style={{ gridTemplateRows: '1fr' }}>
          <div className="team-body-inner">
            <div className="team-body-pad">
              <Field req error={teamNameError ? 'Requerido' : null}>
                <input
                  value={teamName}
                  onChange={e => setTeamName(e.target.value.toUpperCase())}
                  placeholder="LOS GLADIADORES"
                  style={{ fontFamily: 'Anton, sans-serif', fontSize: 28, letterSpacing: '0.04em' }}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* Member cards */}
      {members.map((m, i) => (
        <MemberCard
          key={i}
          idx={i}
          data={m}
          errors={submitAttempted || memberComplete[i] ? memberErrors[i] : {}}
          onChange={nm => {
            const next = members.slice();
            next[i] = nm;
            setMembers(next);
          }}
          open={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          complete={memberComplete[i]}
        />
      ))}

      {/* Gender validation banner */}
      <div className={'gender-warn' + (genderOK ? ' ok' : '')}>
        {genderOK
          ? <Icon.Check className="ic" style={{ width: 18, height: 18 }} />
          : <Icon.Alert className="ic" style={{ width: 18, height: 18 }} />}
        <div>
          <strong style={{ fontFamily: 'Anton, sans-serif', fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
            {genderOK ? 'Equipo mixto válido' : 'Regla obligatoria · equipo mixto'}
          </strong>
          {genderOK
            ? 'Tu equipo cumple con la regla: al menos un hombre y una mujer.'
            : 'Debe haber al menos un hombre y una mujer en el equipo.'}
        </div>
      </div>

      {/* Error de API */}
      {apiError && (
        <div className="gender-warn" style={{ borderColor: 'rgba(229,53,53,0.4)', background: 'rgba(229,53,53,0.06)' }}>
          <Icon.Alert className="ic" style={{ width: 18, height: 18, color: '#e03535' }} />
          <div>
            <strong style={{ fontFamily: 'Anton, sans-serif', fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 4, color: '#e03535' }}>
              Error al inscribir
            </strong>
            {apiError}
          </div>
        </div>
      )}

      <div className="submit-row">
        <p className="legal">
          Al inscribir aceptas el reglamento del evento, la política de tratamiento de datos y el<br />
          consentimiento físico-deportivo de Guerreros Gym.
        </p>
        <button
          type="submit"
          className="btn-primary"
          disabled={apiLoading || (!allOK && submitAttempted)}
        >
          {apiLoading
            ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'ep-spin 0.8s linear infinite', marginRight: 8 }} />Enviando…</>
            : <>Inscribir equipo <Icon.Arrow style={{ width: 18, height: 18 }} /></>}
        </button>
      </div>
    </form>
  );
}

/* ============================================================
   NAV
   ============================================================ */
function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#top" className="nav-logo">
          <img src={IMG.logo} alt="Guerreros Gym" />
          <div>
            <div className="b1">Reto Guerreros Gym</div>
            <div className="b2">Cucuta · 25 y 26 de junio</div>
          </div>
        </a>
        <div className="nav-links">
          <a href="#evento">Evento</a>
          <a href="#video">Ejercicios</a>
          <a href="#premios">Premios</a>
          <a href="#inscripcion" className="nav-cta">
            Inscribir equipo <Icon.Arrow style={{ width: 14, height: 14 }} />
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ============================================================
   COUNTDOWN DISPLAY
   ============================================================ */
function Countdown() {
  const { days, hours, mins, secs } = useCountdown(EVENT_DATE);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="countdown">
      <div className="countdown-inner">
        <div className="countdown-label">Faltan</div>
        <div className="countdown-time">
          <div className="cd-unit"><div className="num">{pad(days)}</div><div className="lbl">Días</div></div>
          <div className="cd-sep">:</div>
          <div className="cd-unit"><div className="num">{pad(hours)}</div><div className="lbl">Horas</div></div>
          <div className="cd-sep">:</div>
          <div className="cd-unit"><div className="num">{pad(mins)}</div><div className="lbl">Min</div></div>
          <div className="cd-sep">:</div>
          <div className="cd-unit"><div className="num">{pad(secs)}</div><div className="lbl">Seg</div></div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HERO
   ============================================================ */
function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero-photo">
        <img src={IMG.hero} alt="Atletas en Guerreros Gym" style={{ objectPosition: '55% 30%' }} />
      </div>
      <div className="hero-bg-glow" />

      <div className="hero-wrap">
        <div className="hero-left">
          <div className="hero-meta">
            <span className="dot" />
            <span className="pre">Preventa abierta</span>
            <span className="sep" />
            <span>25 + 26 Junio · Cucuta</span>
          </div>
          <h1 className="display">
            <span className="line small">Reto</span>
            <span className="line accent">Guerreros</span>
            <span className="line gym">
              <span className="gym-text">Gym</span>
              <span className="gym-line" />
            </span>
          </h1>
          <p className="hero-tagline">
            Fuerza<span className="sep">.</span> Equipo<span className="sep">.</span> Disciplina<span className="sep">.</span> Gloria.
          </p>
          <p className="hero-sub">
            ¡No es solo fuerza, <strong>es trabajo en equipo!</strong> Demuestra de
            qué está hecho tu equipo en una competencia diseñada para atletas que
            viven el <strong>entrenamiento funcional</strong>.
          </p>
          <div className="hero-ctas">
            <a href="#inscripcion" className="btn-primary">
              Inscribir mi equipo <Icon.Arrow style={{ width: 18, height: 18 }} />
            </a>
            <a href="#video" className="btn-ghost">
              <Icon.Play style={{ width: 14, height: 14, fill: 'currentColor' }} /> Ver ejercicios
            </a>
          </div>
          <div className="hero-pills">
            <div className="hero-pill">
              <div className="ic"><Icon.Calendar /></div>
              <div>
                <div className="k">Fechas</div>
                <div className="v">25 y 26 de Junio</div>
              </div>
            </div>
            <div className="hero-pill">
              <div className="ic"><Icon.Clock /></div>
              <div>
                <div className="k">Duración</div>
                <div className="v">Tan solo 15 min</div>
              </div>
            </div>
            <div className="hero-pill">
              <div className="ic"><Icon.Users /></div>
              <div>
                <div className="k">Equipos mixtos</div>
                <div className="v">3 personas</div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-right" />
      </div>

      <Countdown />
    </header>
  );
}

/* ============================================================
   FORMAT SECTION
   ============================================================ */
function Format() {
  const cards = [
    {
      tag: '01 / Fecha',
      photo: IMG.fmtDate,
      title: <>25<span style={{ color: 'var(--accent)' }}>·</span>26 <span className="big">Junio</span></>,
      desc: 'Dos jornadas de competencia: eliminatorias el sábado y finales el domingo. Toda la energía concentrada en un fin de semana.',
    },
    {
      tag: '02 / Equipos',
      photo: IMG.fmtTeam,
      title: <><span className="big">3</span> Mixtos</>,
      desc: 'Tres atletas por equipo. Obligatorio al menos un hombre y una mujer — los equipos del mismo género no pasan filtro.',
    },
    {
      tag: '03 / Duración',
      photo: IMG.fmtTime,
      title: <><span className="big">15</span> Minutos</>,
      desc: 'Una sola ventana de 15 minutos por ronda. Sin descansos. Sin excusas. Estrategia, fuerza y resistencia al límite.',
    },
    {
      tag: '04 / Intensidad',
      photo: IMG.fmtIntense,
      title: <><span className="big">∞</span> Funcional</>,
      desc: 'Entrenamiento funcional puro. Movimientos compuestos, cardio y fuerza en circuito continuo, auditados por el staff de Guerreros.',
    },
  ];
  return (
    <section id="evento">
      <div className="wrap">
        <span className="section-eyebrow">El formato</span>
        <h2 className="section-title">
          Quince minutos. <span className="accent">Tres guerreros.</span><br />
          Una <span className="outline">victoria.</span>
        </h2>
        <p className="section-lead">
          Un formato directo y exigente diseñado para que cada segundo cuente. Equipos
          mixtos enfrentándose en pruebas funcionales auditadas por el staff de Guerreros Gym.
        </p>
        <div className="format-grid">
          {cards.map((c, i) => (
            <div className="format-card" key={i}>
              <div className="photo">
                <span className="tag">{c.tag}</span>
                <img src={c.photo} alt="" loading="lazy" />
              </div>
              <div className="body">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   VIDEO SECTION
   ============================================================ */
function VideoSection() {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="video-section" id="video">
      <div className="wrap">
        <span className="section-eyebrow">Ejercicios oficiales</span>
        <h2 className="section-title">
          Mira los <span className="accent">ejercicios</span> oficiales
        </h2>
        <p className="section-lead">
          Movimientos y estándares de la competencia explicados por el staff de Guerreros Gym.
          Estúdialos, practícalos y llega listo a romper marca.
        </p>
        <div className="video-frame" onClick={() => setPlaying(true)}>
          <img src={IMG.video} alt="Video de los ejercicios" className="video-poster" />
          <div className="video-inner">
            <div className="play-big">
              <Icon.Play />
            </div>
            <div className="video-title">{playing ? 'Cargando…' : 'Reproducir video'}</div>
            <div className="video-sub">// Próximamente — video de los ejercicios oficiales</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PRIZES
   ============================================================ */
function Prizes() {
  return (
    <section className="prizes" id="premios">
      <div className="wrap">
        <div className="prizes-head">
          <span className="section-eyebrow">Premios en efectivo</span>
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            Lucha por <span className="accent">la gloria</span>
          </h2>
        </div>

        <div className="podium">
          {/* 2do lugar */}
          <div className="podium-step silver">
            <div className="podium-trophy">
              <Trophy color="currentColor" size={92} />
            </div>
            <div className="podium-amount"><span className="cur">$</span>600.000</div>
            <div className="podium-cop">COP</div>
            <div className="podium-place">2do Lugar</div>
            <div className="podium-base" />
          </div>

          {/* 1er lugar */}
          <div className="podium-step gold">
            <div className="podium-trophy">
              <div className="podium-crown"><Crown color="currentColor" /></div>
              <Trophy color="var(--accent)" size={110} />
            </div>
            <div className="podium-amount"><span className="cur">$</span>1.000.000</div>
            <div className="podium-cop">COP</div>
            <div className="podium-place">1er Lugar</div>
            <div className="podium-base" />
          </div>

          {/* 3er lugar */}
          <div className="podium-step bronze">
            <div className="podium-trophy">
              <Trophy color="currentColor" size={92} />
            </div>
            <div className="podium-amount"><span className="cur">$</span>300.000</div>
            <div className="podium-cop">COP</div>
            <div className="podium-place">3er Lugar</div>
            <div className="podium-base" />
          </div>
        </div>

        <div className="podium-footer">Premios entregados en efectivo al finalizar la competencia.</div>
      </div>
    </section>
  );
}

/* ============================================================
   REGISTER SECTION
   ============================================================ */
function Register() {
  return (
    <section className="register" id="inscripcion">
      <div className="wrap">
        <span className="section-eyebrow">Inscripción</span>
        <h2 className="section-title">Inscribe a tu <span className="accent">Equipo</span></h2>
        <p className="section-lead">
          Tres atletas. Diligencia los datos de cada uno con cuidado — esta información se usa
          para la organización de la competencia, los brazaletes de identificación y los protocolos médicos.
        </p>

        <div className="form-shell">
          <aside className="form-side">
            <div className="photo">
              <span className="photo-tag">★ Preventa</span>
              <img src={IMG.formSide} alt="" loading="lazy" />
              <div className="photo-title">Asegura tu cupo<br />antes que se acabe</div>
            </div>
            <div className="body">
              <h3>Resumen de pago</h3>
              <div className="price-block">
                <div className="price-row">
                  <span>Precio regular</span>
                  <span style={{ textDecoration: 'line-through', opacity: 0.45 }}>$150.000</span>
                </div>
                <div className="price-row" style={{ color: 'var(--accent)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace' }}>OFERTA</span>
                    Preventa activa
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>−$30.000</span>
                </div>
              </div>
              <div className="price-total">
                <div>
                  <div className="lab">Total equipo</div>
                  <div style={{ fontSize: 14, color: 'var(--ink-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 4 }}>3 personas · COP</div>
                </div>
                <div className="val">$120.000<small>Preventa</small></div>
              </div>
              <p className="note">
                El pago se coordina por WhatsApp tras enviar el formulario. Cupos limitados —
                la preventa cierra al completar los equipos. No reembolsable; transferible
                hasta 7 días antes del evento.
              </p>
            </div>
          </aside>

          <RegistrationForm />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CONTACT
   ============================================================ */
function Contact() {
  return (
    <section className="contact" id="contacto">
      <div className="wrap">
        <div className="contact-head">
          <div>
            <span className="section-eyebrow">Contacto</span>
            <h2 className="section-title">¿Preguntas? <span className="outline">Escríbenos.</span></h2>
          </div>
          <p className="section-lead" style={{ maxWidth: 420 }}>
            Resolvemos dudas sobre reglamento, pagos y formato directamente por nuestras
            redes. En línea en horario de gimnasio.
          </p>
        </div>

        <div className="contact-grid">
          <a href="https://instagram.com/guerrerosgymcucuta" target="_blank" rel="noreferrer" className="contact-card">
            <div className="ic-wrap"><Icon.Instagram /></div>
            <div className="k">Instagram</div>
            <div className="v">@guerrerosgymcucuta</div>
            <div className="d">Resultados en vivo, próximos eventos y contenido del gimnasio.</div>
            <Icon.Arrow className="arrow" style={{ width: 22, height: 22 }} />
          </a>
          <a href="https://wa.me/573222177207" target="_blank" rel="noreferrer" className="contact-card">
            <div className="ic-wrap"><Icon.Whatsapp /></div>
            <div className="k">WhatsApp</div>
            <div className="v">322 217 7207</div>
            <div className="d">Coordinamos pagos en preventa y resolvemos dudas de inmediato.</div>
            <Icon.Arrow className="arrow" style={{ width: 22, height: 22 }} />
          </a>
        </div>

        <footer className="ep-footer">
          <div>© 2026 Guerreros Gym · Cucuta</div>
          <div>Entrenamiento Funcional · Colombia</div>
          <div>Reto Guerreros Gym 2026</div>
        </footer>
      </div>
    </section>
  );
}

/* ============================================================
   APP ROOT
   ============================================================ */
export default function EventPage() {
  return (
    <div className="ep-root">
      <Nav />
      <Hero />
      <Format />
      <VideoSection />
      <Prizes />
      <Register />
      <Contact />
    </div>
  );
}
