import { tool } from 'ai';
import { z } from 'zod';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.escapemaster.es/api";

// Helper function to make authenticated requests to the python backend
async function fetchBackend(endpoint: string, token: string, method = 'GET', body?: any) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: HeadersInit = {
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

export function getTools(token: string) {
  return {
    getDashboardSummary: tool({
        description: 'Obtén el sumario del dashboard incluyendo transacciones recientes, próximas reservas y alertas de ocupación.',
        parameters: z.object({}),
        execute: async () => {
            return await fetchBackend('/dashboard/summary', token);
        },
    }),
    getRevenueStats: tool({
        description: 'Pide las estadísticas de revenue e ingresos usando un periodo (ej. month, week, year).',
        parameters: z.object({
            period: z.enum(['week', 'month', 'year']).describe('Periodo de tiempo para consultar.')
        }),
        execute: async ({ period }) => {
            return await fetchBackend(`/dashboard/stats?period=${period}`, token);
        },
    }),
    getBookingsList: tool({
        description: 'Lista las últimas reservas del escape room. Se pueden usar filtros como limit, estatus o un rango de fechas.',
        parameters: z.object({
            limit: z.number().optional().describe('Cantidad máxima de resultados'),
            status: z.string().optional().describe('Estatus (ej. confirmed, pending, cancelled)'),
            dateFrom: z.string().optional().describe('Fecha inicial en formato ISO YYYY-MM-DD'),
            dateTo: z.string().optional().describe('Fecha final en formato ISO YYYY-MM-DD')
        }),
        execute: async ({ limit, status, dateFrom, dateTo }) => {
            let url = '/bookings?';
            if (limit) url += `limit=${limit}&`;
            if (status) url += `status=${status}&`;
            if (dateFrom) url += `date_from=${dateFrom}&`;
            if (dateTo) url += `date_to=${dateTo}&`;
            
            // Limit output so context length doesn't explode
            return await fetchBackend(url, token);
        }
    }),
    getRoomsStatus: tool({
        description: 'Consulta una lista de las distintas salas (juegos físicos de escape room) disponibles y sus rangos de precios.',
        parameters: z.object({}),
        execute: async () => {
            return await fetchBackend('/rooms', token);
        }
    }),
    getPaymentsLedger: tool({
        description: 'Lista las transacciones (abonos, cargos, depósitos) financieras.',
        parameters: z.object({
            limit: z.number().optional().describe('Número de cobros a obtener'),
        }),
        execute: async ({ limit }) => {
             return await fetchBackend(`/payments?limit=${limit || 10}`, token);
        }
    })
  };
}
