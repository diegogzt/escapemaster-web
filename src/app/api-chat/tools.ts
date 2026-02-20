import { tool } from 'ai';
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

export function getTools(token: string) {
  return {
    getDashboardSummary: tool({
        description: 'Get dashboard summary including recent transactions, upcoming bookings, and occupancy alerts.',
        parameters: z.object({
          // Adding dummy field to satisfy ai@6.x strict overload requirement for execute
          _noop: z.string().optional(),
        }),
        // @ts-ignore ai@6.x overload type issue with optional-only schemas
        execute: async () => {
            console.log('[tools] getDashboardSummary called');
            return await fetchBackend('/dashboard/summary', token);
        },
    }),
    getRevenueStats: tool({
        description: 'Get revenue and income stats for a given period (week, month, or year).',
        parameters: z.object({
            period: z.enum(['week', 'month', 'year']).describe('Time period to query.')
        }),
        // @ts-ignore
        execute: async ({ period }: { period: 'week' | 'month' | 'year' }) => {
            console.log('[tools] getRevenueStats called with period:', period);
            return await fetchBackend(`/dashboard/stats?period=${period}`, token);
        },
    }),
    getBookingsList: tool({
        description: 'List bookings from the escape room. Supports filters: limit (max results), status (confirmed/pending/cancelled), dateFrom and dateTo (ISO date YYYY-MM-DD).',
        parameters: z.object({
            limit: z.number().optional().describe('Max number of results'),
            status: z.string().optional().describe('Status filter: confirmed, pending, cancelled'),
            dateFrom: z.string().optional().describe('Start date in ISO format YYYY-MM-DD'),
            dateTo: z.string().optional().describe('End date in ISO format YYYY-MM-DD')
        }),
        // @ts-ignore
        execute: async ({ limit, status, dateFrom, dateTo }: { limit?: number; status?: string; dateFrom?: string; dateTo?: string }) => {
            let url = '/bookings?';
            if (limit) url += `limit=${limit}&`;
            if (status) url += `status=${status}&`;
            if (dateFrom) url += `date_from=${dateFrom}&`;
            if (dateTo) url += `date_to=${dateTo}&`;
            console.log('[tools] getBookingsList called, url:', url);
            return await fetchBackend(url, token);
        }
    }),
    getRoomsStatus: tool({
        description: 'Get list of escape room rooms (games) with their status and price ranges.',
        parameters: z.object({
          _noop: z.string().optional(),
        }),
        // @ts-ignore
        execute: async () => {
            console.log('[tools] getRoomsStatus called');
            return await fetchBackend('/rooms', token);
        }
    }),
    getPaymentsLedger: tool({
        description: 'List financial transactions (charges, payments, deposits).',
        parameters: z.object({
            limit: z.number().optional().describe('Number of payments to fetch'),
        }),
        // @ts-ignore
        execute: async ({ limit }: { limit?: number }) => {
            console.log('[tools] getPaymentsLedger called with limit:', limit);
            return await fetchBackend(`/payments?limit=${limit || 10}`, token);
        }
    })
  };
}
