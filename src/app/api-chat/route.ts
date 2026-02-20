import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { google } from '@ai-sdk/google';
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
    if (model === 'gemini') {
        aiModel = google('gemini-2.0-flash');
    }
    console.log('[api-chat] Using model:', model === 'gemini' ? 'gemini-2.0-flash' : 'mistral-large-latest');

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
      Usa un tono profesional, amable y directo.
      Tienes acceso a herramientas para buscar reservaciones, salas, e información financiera. Siempre debes llamar a estas herramientas para responder a preguntas relativas a datos reales del escape room en lugar de inventarlas. Si el usuario te indica fechas abstractas (Ej. "hoy", "este mes", "mañana"), calcula las fechas correctas antes de usar la herramienta correspondiente.
      Hoy es: ${new Date().toISOString().split('T')[0]}`,
      tools: bearerToken ? getTools(bearerToken) : undefined,
      stopWhen: stepCountIs(5), // Allow up to 5 steps: tool calls + final response
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
