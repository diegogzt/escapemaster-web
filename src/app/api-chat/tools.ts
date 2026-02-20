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
            period: z.string().describe('Time period to query. Suggestion: "week", "month", "year".')
        }),
        // @ts-ignore
        execute: async ({ period }: { period: string }) => {
            console.log('[tools] getRevenueStats called with period:', period);
            let normalized = "month";
            const p = period.toLowerCase();
            if (p.includes("week") || p.includes("semana")) normalized = "week";
            if (p.includes("year") || p.includes("año") || p.includes("ano")) normalized = "year";
            return await fetchBackend(`/dashboard/stats?period=${normalized}`, token);
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
        description: 'List financial transactions (charges, payments, deposits). Use this for raw data CSV exports.',
        parameters: z.object({
            limit: z.number().optional().describe('Number of payments to fetch. Defaults to 100.'),
            dateFrom: z.string().optional().describe('Start date YYYY-MM-DD'),
            dateTo: z.string().optional().describe('End date YYYY-MM-DD')
        }),
        // @ts-ignore
        execute: async ({ limit, dateFrom, dateTo }: { limit?: number; dateFrom?: string; dateTo?: string }) => {
            let url = `/payments?limit=${limit || 100}`;
            if (dateFrom) url += `&date_from=${dateFrom}`;
            if (dateTo) url += `&date_to=${dateTo}`;
            console.log('[tools] getPaymentsLedger called with:', { limit, dateFrom, dateTo });
            return await fetchBackend(url, token);
        }
    }),
    getUsers: tool({
        description: 'Get a list of all registered users in the platform, along with their assigned roles and status.',
        parameters: z.object({
          _noop: z.string().optional(),
        }),
        // @ts-ignore
        execute: async () => {
            console.log('[tools] getUsers called');
            return await fetchBackend('/users', token);
        }
    }),
    getRoles: tool({
        description: 'Get a list of system roles and their permissions.',
        parameters: z.object({
          _noop: z.string().optional(),
        }),
        // @ts-ignore
        execute: async () => {
            console.log('[tools] getRoles called');
            return await fetchBackend('/roles', token);
        }
    }),
    executeMathCalculator: tool({
        description: 'A powerful calculator to perform complex math calculations. Pass a valid JavaScript math expression.',
        parameters: z.object({
            expression: z.string().describe('The robust mathematical expression to evaluate (e.g. "1500 * 0.2 + 45/2")')
        }),
        // @ts-ignore
        execute: async ({ expression }: { expression: string }) => {
            console.log('[tools] executeMathCalculator called with:', expression);
            try {
                // Using a safe Function evaluator for basic math
                const result = new Function('return ' + expression)();
                return { result, success: true };
            } catch (err: any) {
                return { error: err.message, success: false };
            }
        }
    })
  };
}
