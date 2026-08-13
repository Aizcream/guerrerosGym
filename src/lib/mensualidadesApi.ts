/**
 * mensualidadesApi.ts
 *
 * Cliente HTTP tipado para el endpoint de mensualidades de Guerreros Gym.
 * La URL base se lee desde la variable de entorno PUBLIC_API_BASE_URL.
 */

const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL as string;

export interface IntegrantePayload {
  nombres_apellidos: string;
  cedula: string;
  email?: string;
  celular?: string;
}

export interface PagoMensualidadPayload {
  nombres_apellidos: string;
  cedula: string;
  email: string;
  celular: string;
  plan: 'mensual' | 'trimestral' | 'semestral' | 'duo' | 'trio' | 'familiar' | 'estudiante';
  redirect_url?: string;
  integrantes?: IntegrantePayload[];
  carnet_foto?: string; // URL o base64
}

export interface PagoResponse {
  pago_id: number;
  order_id: number;
  reference: string;
  plan: string;
  plan_tipo: 'individual' | 'grupal' | 'estudiante';
  num_personas: number;
  total_cop: number;
  total_centavos: number;
  checkout_url: string;
}

export interface DetallePagoResponse {
  id: number;
  nombres_apellidos: string;
  cedula: string;
  email: string;
  plan_nombre: string;
  plan_tipo: 'individual' | 'grupal' | 'estudiante';
  num_personas: number;
  monto_cop: number;
  estado: 'PENDING' | 'PAGADO' | 'CANCELADO';
  creado_en: string;
  integrantes?: IntegrantePayload[];
}

/**
 * Registra un pago de mensualidad en WordPress y retorna los datos con la URL de Wompi.
 */
export async function pagarMensualidad(payload: PagoMensualidadPayload): Promise<PagoResponse> {
  const url = `${BASE_URL}/wp-json/gg-mensualidades/v1/pagar`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error || (data.errores ? data.errores.join(' ') : 'Error al procesar el pago.');
    throw new Error(errorMsg);
  }

  return data as PagoResponse;
}

/**
 * Obtiene el detalle de un pago y consulta a Wompi si el estado local aún es PENDING.
 */
export async function obtenerPago(pagoId: number, wompiTxId?: string): Promise<DetallePagoResponse> {
  let url = `${BASE_URL}/wp-json/gg-mensualidades/v1/pago/${pagoId}`;
  if (wompiTxId) {
    url += `?wompi_tx_id=${encodeURIComponent(wompiTxId)}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener la información de pago.');
  }

  return data as DetallePagoResponse;
}
