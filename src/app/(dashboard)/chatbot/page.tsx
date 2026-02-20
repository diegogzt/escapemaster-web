"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, User, Loader2, Settings2, Wrench } from "lucide-react";
import { cn } from "@/utils";

// Tool name → Spanish label
const TOOL_LABELS: Record<string, string> = {
  getDashboardSummary: "Resumen del dashboard",
  getRevenueStats: "Estadísticas de ingresos",
  getBookingsList: "Lista de reservas",
  getRoomsStatus: "Estado de las salas",
  getPaymentsLedger: "Libro de transacciones",
};

type MessagePart = {
  type: string;
  text?: string;
  toolName?: string;
  state?: string;
  input?: unknown;
  output?: unknown;
};

type Message = {
  id: string;
  role: string;
  parts?: MessagePart[];
};

export default function ChatbotPage() {
  const [model, setModel] = useState("mistral");
  const [input, setInput] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api-chat",
    body: { model, token },
  }), [token, model]);

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: [
      {
        id: "sys-01",
        role: "assistant" as const,
        parts: [{ type: "text" as const, text: "¡Hola! Soy tu Asistente Empresarial. Puedo consultar **reservas en vivo**, analizar **ingresos**, verificar **salas** y mucho más. ¿En qué te ayudo hoy?" }],
      }
    ]
  });

  // Blocked whenever the AI is thinking, calling tools, or streaming
  const isBlocked = status === "streaming" || status === "submitted";

  // Detect if a tool is currently being invoked (find active tool part)
  const activeTool = useMemo(() => {
    if (!isBlocked) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i] as Message;
      if (msg.role === "assistant") {
        const toolPart = msg.parts?.find(
          (p) => p.type?.startsWith("tool-") && (p.state === "input-streaming" || p.state === "input-available")
        );
        if (toolPart?.toolName) return toolPart.toolName;
      }
    }
    return null;
  }, [messages, isBlocked]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBlocked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isBlocked) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[var(--color-background)] rounded-2xl border border-[var(--color-beige)] overflow-hidden shadow-sm max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="bg-[var(--color-light)] p-4 border-b border-[var(--color-beige)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--color-foreground)]">AI Assistant</h1>
            <p className="text-xs text-[var(--color-muted-foreground)]">Analítica Operativa en Tiempo Real</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Settings2 size={16} className="text-secondary" />
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="text-xs bg-white border border-[var(--color-beige)] rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20 text-[var(--color-foreground)] font-medium"
          >
            <option value="mistral">Mistral Large (Recomendado)</option>
            <option value="gemini">Gemini 2.0 Flash</option>
          </select>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {(messages as Message[]).map((message) => {
          const textPart = message.parts?.find((p) => p.type === "text");

          // Skip invisible assistant messages
          if (message.role === "assistant" && !textPart?.text) return null;

          return (
            <div
              key={message.id}
              className={cn(
                "max-w-[85%] flex gap-3",
                message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                message.role === "user" ? "bg-primary text-white" : "bg-blue-100 text-blue-700"
              )}>
                {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className="space-y-2 max-w-full overflow-hidden">
                {textPart?.text && (
                  <div className={cn(
                    "py-3 px-4 rounded-2xl text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-white border border-[var(--color-beige)] text-gray-800 rounded-tl-sm shadow-sm"
                  )}>
                    {message.role === "user" ? (
                      <span>{textPart.text}</span>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-headings:mt-2 prose-headings:mb-1">
                        <ReactMarkdown>{textPart.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Global "Trabajando..." indicator when blocked */}
        {isBlocked && (
          <div className="mr-auto max-w-[85%] flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-blue-100 text-blue-700">
              <Bot size={16} />
            </div>
            <div className="flex flex-col gap-1.5">
              {activeTool ? (
                // Tool invocation indicator
                <div className="flex items-center gap-2.5 py-2.5 px-4 bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-sm text-sm text-amber-800 shadow-sm animate-pulse">
                  <Wrench size={14} className="flex-shrink-0 animate-spin" style={{ animationDuration: "2s" }} />
                  <span className="font-medium">Consultando: </span>
                  <span className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">
                    {TOOL_LABELS[activeTool] || activeTool}
                  </span>
                  <Loader2 size={14} className="animate-spin ml-auto flex-shrink-0" />
                </div>
              ) : (
                // Thinking indicator
                <div className="flex items-center gap-1.5 py-3 px-4 bg-white border border-[var(--color-beige)] rounded-2xl rounded-tl-sm shadow-sm w-20 justify-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[var(--color-light)] border-t border-[var(--color-beige)]">
        {/* Status bar when blocked */}
        {isBlocked && (
          <div className="flex items-center justify-center gap-2 mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full py-1.5 px-3 w-fit mx-auto">
            <Loader2 size={11} className="animate-spin" />
            {activeTool
              ? `Consultando ${TOOL_LABELS[activeTool] || activeTool}...`
              : "El asistente está procesando tu mensaje..."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isBlocked}
            placeholder={isBlocked ? "Esperando respuesta..." : "Pregunta sobre reservas, ventas, horarios..."}
            className="w-full bg-white border border-[var(--color-beige)] rounded-full pl-6 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow text-[var(--color-foreground)] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isBlocked || !input.trim()}
            className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBlocked ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <p className="text-center text-[10px] text-[var(--color-muted-foreground)] mt-3">
          El asistente consulta la base de datos en directo. Puede tardar unos segundos.
        </p>
      </div>
    </div>
  );
}
