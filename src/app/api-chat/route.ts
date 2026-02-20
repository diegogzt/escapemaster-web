import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';
import { getTools } from './tools';

// Allow responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages: uiMessages, model, token } = body;

    console.log('[api-chat] Received request:', { model, hasToken: !!token, messageCount: uiMessages?.length });
    console.log('[api-chat] Last message:', JSON.stringify(uiMessages?.[uiMessages.length - 1], null, 2));
    
    // Default to Mistral if no model specified or invalid
    let aiModel: any = mistral('mistral-large-latest');
    let modelNameLog = 'mistral-large-latest';
    
    if (model === 'gemini') {
        // As of AI SDK mapping, using latest 2.0-flash which fulfills the user's latest and cheapest lightning model request
        aiModel = google('gemini-2.0-flash');
        modelNameLog = 'gemini-2.0-flash';
    } else if (model === 'glm') {
        const zai = createOpenAI({
          baseURL: 'https://api.z.ai/api/paas/v4/',
          apiKey: '4d1cb021b81a4551a93e5388dbf7facf.DxB9Zna5GvnuGJvb', // Key provided via User instructions
        });
        aiModel = zai('glm-4.7');
        modelNameLog = 'glm-4.7';
    }
    console.log('[api-chat] Using model:', modelNameLog);

    // Use token from request body (sent by DefaultChatTransport body option)
    // Fallback to Authorization header for backwards compatibility
    const bearerToken = token || req.headers.get('authorization')?.replace('Bearer ', '') || null;
    console.log('[api-chat] Bearer token present:', !!bearerToken);

    // Convert UIMessages (with parts) to model messages that streamText understands
    let modelMessages: any[];
    try {
      modelMessages = await convertToModelMessages(uiMessages);
      console.log('[api-chat] Converted model messages:', JSON.stringify(modelMessages, null, 2));
    } catch (convErr) {
      console.error('[api-chat] Failed to convert messages:', convErr);
      // Fallback: pass messages as-is
      modelMessages = uiMessages;
    }

    const result = streamText({
      model: aiModel,
      messages: modelMessages,
      system: `Eres el AI Assistant oficial de Escapemaster (Gestor).
Tu trabajo es ayudar a los trabajadores y administradores a analizar información y realizar operaciones del día a día usando herramientas.
Eres MUY avanzado en matemáticas complejas, análisis de datos y la estructuración de reportes.
MUY IMPORTANTE: Si el usuario o administrador te pide explícitamente "devolver un CSV", "exportar a CSV" o similar, DEBES OBLIGATORIAMENTE formatear los datos en un bloque de código markdown de tipo csv. Es decir, debes envolver el CSV entre triple comilla invertida (ej. \`\`\`csv y terminando con \`\`\`), utilizando comas o punto y coma como separadores.
OJO: ¡Genera el código CSV en la MISMA respuesta donde avisas que lo vas a generar! NUNCA respondas "Voy a exportarlo" y luego te detengas sin poner el bloque \`\`\`csv debajo. Asegúrate de mostrar TODOS los resultados extraídos (usando límites en las herramientas) y jamás recortes u omitas la tabla.
REGLA ESTRICTA CSV: El bloque \`\`\`csv DEBE contener ÚNICAMENTE datos válidos en formato CSV (cabeceras en la primera línea y luego los datos). NUNCA incluyas texto conversacional dentro del bloque de código. Si no hay datos, incluye solo las cabeceras.
BÚSQUEDAS DE FECHAS: Si el usuario pide datos de "el último mes" y el mes actual no tiene registros, automáticamente busca y devuelve los datos del mes anterior (los últimos 30 días). Usa explícitamente los parámetros dateFrom y dateTo en las herramientas.
Si debes hacer cálculos complejos iterando sobre muchos usuarios o roles, utiliza la herramienta executeMathCalculator o hazlo internamente garantizando precisión. Siempre usa herramientas para consultar la base de datos viva.
Hoy es: ${new Date().toISOString().split('T')[0]}`,
      tools: bearerToken ? getTools(bearerToken) : undefined,
      stopWhen: stepCountIs(10), // Allow up to 10 steps: tool calls + final response
      onFinish: ({ text, finishReason }) => {
        console.log('[api-chat] Stream finished:', { finishReason, textLength: text.length, textPreview: text.substring(0, 100) });
      },
    });

    console.log('[api-chat] Streaming response started');
    // ai@6.x: toUIMessageStreamResponse() is the correct method
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[api-chat] Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
