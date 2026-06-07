/**
 * inscripcionesApi.ts
 *
 * Cliente HTTP tipado para el endpoint de inscripciones de Guerreros Gym.
 * La URL base se lee desde la variable de entorno PUBLIC_API_BASE_URL,
 * que Astro inyecta en el bundle del cliente gracias al prefijo PUBLIC_.
 *
 * Endpoints:
 *   POST /wp-json/wef/v1/inscripciones   → crear inscripción y obtener checkout URL
 *   GET  /wp-json/wef/v1/inscripciones/{id} → consultar estado tras redirección de Wompi
 */

// ---------------------------------------------------------------------------
// Configuración base
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL as string;

if (!BASE_URL) {
  console.error(
    '[inscripcionesApi] La variable PUBLIC_API_BASE_URL no está definida. ' +
    'Crea un archivo .env con PUBLIC_API_BASE_URL=https://api.guerrerosgym.com'
  );
}

const ENDPOINT = `${BASE_URL}/wp-json/wef/v1/inscripciones`;

// ---------------------------------------------------------------------------
// Tipos — Payload de solicitud
// ---------------------------------------------------------------------------

export interface AtletaPayload {
  nombres_apellidos: string;
  cedula: string;
  email: string;
  celular: string;
  tipo_sangre: string;
  genero: string;
  emergencia_nombre: string;
  emergencia_telefono: string;
}

export interface InscripcionPayload {
  nombre_equipo: string;
  /** Email del primer atleta — se usa como contacto principal */
  email_contacto: string;
  /** Celular del primer atleta — se usa como contacto principal */
  telefono_contacto: string;
  /** Categoría en la que compite el equipo: 'Principiante' | 'Avanzado' */
  categoria: 'Principiante' | 'Avanzado';
  atletas: AtletaPayload[];
}

// ---------------------------------------------------------------------------
// Tipos — Respuesta del servidor
// ---------------------------------------------------------------------------

export interface InscripcionCreada {
  inscripcion_id: number;
  order_id: number;
  total_cop: number;
  num_atletas: number;
  /** URL de Wompi/WooCommerce a donde redirigir al usuario para pagar */
  checkout_url: string;
}

export type EstadoPago = 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed' | string;

export interface InscripcionEstado {
  id: string | number;
  nombre_equipo: string;
  email_contacto: string;
  telefono_contacto: string;
  monto_total_cop: string | number;
  num_atletas: string | number;
  estado: string;
  order_id: string | number;
  creado_en?: string;
  actualizado_en?: string;
  atletas?: any[];
}

// ---------------------------------------------------------------------------
// Error tipado de API
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message?: string
  ) {
    super(message ?? `Error ${status} del servidor`);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Helper interno
// ---------------------------------------------------------------------------

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...init,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data,
      data?.message ?? `Error ${response.status}: ${response.statusText}`
    );
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// POST /inscripciones — crear inscripción
// ---------------------------------------------------------------------------

/**
 * Envía los datos del equipo y los tres atletas al backend.
 * En caso de éxito, el backend devuelve una `checkout_url` de Wompi
 * a la que se debe redirigir inmediatamente al usuario.
 */
export async function postInscripcion(
  payload: InscripcionPayload
): Promise<InscripcionCreada> {
  return fetchJSON<InscripcionCreada>(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// GET /inscripciones/{id} — consultar estado tras pago
// ---------------------------------------------------------------------------

/**
 * Consulta el estado de la inscripción después de que Wompi redirige de vuelta.
 * Llama a esto con el inscripcion_id presente en los query params de la URL.
 */
export async function getInscripcion(
  inscripcionId: number | string
): Promise<InscripcionEstado> {
  return fetchJSON<InscripcionEstado>(`${ENDPOINT}/${inscripcionId}`);
}

// ---------------------------------------------------------------------------
// Helper — mapeo de datos del formulario al payload de la API
// ---------------------------------------------------------------------------

const GENERO_LABEL: Record<string, string> = {
  M: 'Hombre',
  F: 'Mujer',
  X: 'Otro',
};

export interface FormMember {
  nombres: string;
  correo: string;
  cedula: string;
  celular: string;
  sangre: string;
  emergencia_nombre: string;
  emergencia_tel: string;
  genero: string;
}

/**
 * Convierte los datos del formulario al formato que espera el endpoint.
 * El email y teléfono de contacto se toman del primer integrante (líder).
 */
export function buildPayload(
  teamName: string,
  members: FormMember[],
  categoria: 'Principiante' | 'Avanzado'
): InscripcionPayload {
  return {
    nombre_equipo: teamName,
    email_contacto: members[0].correo,
    telefono_contacto: members[0].celular,
    categoria,
    atletas: members.map((m) => ({
      nombres_apellidos: m.nombres,
      cedula: m.cedula,
      email: m.correo,
      celular: m.celular,
      tipo_sangre: m.sangre,
      genero: GENERO_LABEL[m.genero] ?? m.genero,
      emergencia_nombre: m.emergencia_nombre,
      emergencia_telefono: m.emergencia_tel,
    })),
  };
}

// ---------------------------------------------------------------------------
// localStorage — persistencia de inscripción pendiente
//
// Se guarda ANTES de redirigir a Wompi y se limpia cuando el pago se confirma.
// Permite recuperar el estado si el usuario cierra el navegador, el pago es
// rechazado, o vuelve sin haber completado el checkout.
// ---------------------------------------------------------------------------

const LS_KEY = 'guerreros_gym_inscripcion_pendiente';

export interface InscripcionGuardada extends InscripcionCreada {
  /** Nombre del equipo — para mostrar en la UI de recuperación */
  nombre_equipo: string;
  /** Date.now() del momento en que se guardó, para mostrar hace cuánto */
  guardado_en: number;
}

/**
 * Persiste los datos de la inscripción en localStorage justo antes de
 * redirigir al usuario a la pasarela de pago.
 */
export function guardarInscripcion(
  data: InscripcionCreada,
  nombreEquipo: string
): void {
  try {
    const entry: InscripcionGuardada = {
      ...data,
      nombre_equipo: nombreEquipo,
      guardado_en: Date.now(),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(entry));
  } catch {
    // localStorage no disponible (modo privado, SSR, etc.)
  }
}

/**
 * Lee la inscripción pendiente guardada.
 * Devuelve null si no existe o si el JSON está corrupto.
 */
export function leerInscripcionPendiente(): InscripcionGuardada | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as InscripcionGuardada) : null;
  } catch {
    return null;
  }
}

/**
 * Elimina la inscripción pendiente del localStorage.
 * Llamar cuando el pago se confirma o cuando el usuario descarta el intento.
 */
export function borrarInscripcionPendiente(): void {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // noop
  }
}
