import { z } from 'zod';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.escapemaster.es/api";

// Helper function to make authenticated requests to the python backend
async function fetchBackend(endpoint: string, token: string, method = 'GET', body?: unknown) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Backend API Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
}

// Return tools as plain objects typed to `any` to avoid ai@6.x overload TypeScript conflicts
export function getTools(token: string): Record<string, any> {
  return {
    getDashboardSummary: {
        description: 'Obtén el sumario del dashboard incluyendo transacciones recientes, próximas reservas y alertas de ocupación.',
        parameters: z.object({}),
        execute: async (_args: Record<string, never>) => {
            return await fetchBackend('/dashboard/summary', token);
        },
    },
    getRevenueStats: {
        description: 'Pide las estadísticas de revenue e ingresos usando un periodo (ej. month, week, year).',
        parameters: z.object({
            period: z.enum(['week', 'month', 'year']).describe('Periodo de tiempo para consultar.')
        }),
        execute: async ({ period }: { period: 'week' | 'month' | 'year' }) => {
            return await fetchBackend(`/dashboard/stats?period=${period}`, token);
        },
    },
    getBookingsList: {
        description: 'Lista las últimas reservas del escape room. Se pueden usar filtros como limit, estatus o un rango de fechas.',
        parameters: z.object({
            limit: z.number().optional().describe('Cantidad máxima de resultados'),
            status: z.string().optional().describe('Estatus (ej. confirmed, pending, cancelled)'),
            dateFrom: z.string().optional().describe('Fecha inicial en formato ISO YYYY-MM-DD'),
            dateTo: z.string().optional().describe('Fecha final en formato ISO YYYY-MM-DD')
        }),
        execute: async ({ limit, status, dateFrom, dateTo }: { limit?: number; status?: string; dateFrom?: string; dateTo?: string }) => {
            let url = '/bookings?';
            if (limit) url += `limit=${limit}&`;
            if (status) url += `status=${status}&`;
            if (dateFrom) url += `date_from=${dateFrom}&`;
            if (dateTo) url += `date_to=${dateTo}&`;
            return await fetchBackend(url, token);
        }
    },
    getRoomsStatus: {
        description: 'Consulta una lista de las distintas salas (juegos físicos de escape room) disponibles y sus rangos de precios.',
        parameters: z.object({}),
        execute: async (_args: Record<string, never>) => {
            return await fetchBackend('/rooms', token);
        }
    },
    getPaymentsLedger: {
        description: 'Lista las transacciones (abonos, cargos, depósitos) financieras.',
        parameters: z.object({
            limit: z.number().optional().describe('Número de cobros a obtener'),
        }),
        execute: async ({ limit }: { limit?: number }) => {
            return await fetchBackend(`/payments?limit=${limit || 10}`, token);
        }
    }
  };
}
