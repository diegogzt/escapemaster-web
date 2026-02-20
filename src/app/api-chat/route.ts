import { streamText } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { getTools } from './tools';

// Allow responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();
    
    // Default to Mistral if no model specified or invalid
    let aiModel: any = mistral('mistral-large-latest');
    
    if (model === 'gemini') {
        aiModel = google('gemini-2.0-flash');
    }

    // Capture the Bearer token from the incoming client request
    const authHeader = req.headers.get('authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    const result = streamText({
      model: aiModel,
      messages,
      system: `Eres el AI Assistant oficial de Escapemaster (Gestor).
      Tu trabajo es ayudar a los trabajadores y administradores a analizar información y realizar operaciones del día a día usando herramientas.
      Usa un tono profesional, amable y directo.
      Tienes acceso a herramientas para buscar reservaciones, salas, e información financiera. Siempre debes llamar a estas herramientas para responder a preguntas relativas a datos reales del escape room en lugar de inventarlas. Si el usuario te indica fechas abstractas (Ej. "hoy", "este mes", "mañana"), calcula las fechas correctas antes de usar la herramienta correspondiente.
      Hoy es: ${new Date().toISOString().split('T')[0]}`,
      tools: getTools(token),
    });

    // ai@6.x: toUIMessageStreamResponse() is the correct method
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
