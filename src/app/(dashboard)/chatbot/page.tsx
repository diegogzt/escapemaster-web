"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, User, Loader2, Settings2, Wrench, Menu, Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/utils";

// Tool name → Spanish label
const TOOL_LABELS: Record<string, string> = {
  getDashboardSummary: "Resumen del dashboard",
  getRevenueStats: "Estadísticas de ingresos",
  getBookingsList: "Lista de reservas",
  getRoomsStatus: "Estado de las salas",
  getPaymentsLedger: "Libro de transacciones",
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: any[]; // UIMessage format
};

export default function ChatbotPage() {
  const [model, setModel] = useState("mistral");
  const [input, setInput] = useState("");
  const [token, setToken] = useState<string | null>(null);
  
  // History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      
      const saved = localStorage.getItem("escapemaster_chat_history");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSessions(parsed);
          if (parsed.length > 0) {
            setCurrentSessionId(parsed[0].id);
          } else {
            createNewSession();
          }
        } catch {
          createNewSession();
        }
      } else {
        createNewSession();
      }
    }
  }, []);

  const createNewSession = () => {
    const newId = `session_${Date.now()}`;
    setCurrentSessionId(newId);
    setSessions(prev => [
      {
        id: newId,
        title: "Nueva Conversación",
        updatedAt: Date.now(),
        messages: [{
          id: "sys-01",
          role: "assistant",
          parts: [{ type: "text", text: "¡Hola! Soy tu Asistente Empresarial. Puedo consultar **reservas en vivo**, analizar **ingresos**, verificar **salas** y mucho más. ¿En qué te ayudo hoy?" }],
        }]
      },
      ...prev
    ]);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      if (filtered.length > 0) setCurrentSessionId(filtered[0].id);
      else createNewSession();
    }
  };

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api-chat",
    body: { model, token },
  }), [token, model]);

  // Current session data
  const initialMessages = useMemo(() => {
    return sessions.find(s => s.id === currentSessionId)?.messages || [];
  }, [currentSessionId, sessions]);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: currentSessionId, // Tie hook to current session
    transport,
  });

  // Inject history when session changes
  useEffect(() => {
    if (currentSessionId && initialMessages.length > 0) {
        // Only set if messages is currently empty OR if we switched sessions and the current hook state doesn't match
        if (messages.length === 0 || messages[0]?.id !== initialMessages[0]?.id) {
            setMessages(initialMessages as any);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, initialMessages, setMessages]); // removed messages to prevent infinite loop

  // Sync messages back to the active session in local storage
  useEffect(() => {
    if (!currentSessionId || messages.length === 0) return;
    
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === currentSessionId) {
          // Auto-generate title from first user message if it's "Nueva Conversación"
          let title = s.title;
          if (title === "Nueva Conversación") {
            const firstUserMessage = messages.find((m: any) => m.role === "user");
            if (firstUserMessage) {
              const textPart = (firstUserMessage.parts as any)?.find((p: any) => p.type === "text")?.text;
              if (textPart) {
                title = textPart.slice(0, 30) + (textPart.length > 30 ? "..." : "");
              }
            }
          }
          return { ...s, messages, title, updatedAt: Date.now() };
        }
        return s;
      });
      
      // Save to LS
      localStorage.setItem("escapemaster_chat_history", JSON.stringify(updated));
      return updated;
    });
  }, [messages, currentSessionId]);


  // Blocked whenever the AI is thinking, calling tools, or streaming
  const isBlocked = status === "streaming" || status === "submitted";

  // Detect if a tool is currently being invoked (find active tool part)
  const activeTool = useMemo(() => {
    if (!isBlocked) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i] as any;
      if (msg.role === "assistant") {
        const toolPart = msg.parts?.find(
          (p: any) => p.type?.startsWith("tool-") && (p.state === "input-streaming" || p.state === "input-available")
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
    <div className="flex h-[calc(100vh-80px)] w-full max-w-7xl mx-auto bg-[var(--color-background)] rounded-2xl border border-[var(--color-beige)] overflow-hidden shadow-sm relative">
      
      {/* Sidebar History */}
      <div className={cn(
        "bg-white border-r border-[var(--color-beige)] flex flex-col transition-all duration-300 ease-in-out shrink-0 absolute md:relative z-20 h-full shadow-lg md:shadow-none",
        sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-0 md:translate-x-0 hidden"
      )}>
        <div className="p-4 border-b border-[var(--color-beige)]">
          <button 
            onClick={createNewSession}
            className="w-full flex justify-center items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 py-2 rounded-md font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            Nueva Conversación
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => {
                setCurrentSessionId(session.id);
                // Auto close sidebar on mobile when a conversation is selected
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                currentSessionId === session.id 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-gray-50 text-gray-700"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="flex-shrink-0" />
                <span className="text-sm truncate pr-2">{session.title}</span>
              </div>
              <button 
                onClick={(e) => deleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-500 rounded transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/50">
        {/* Header */}
        <div className="bg-[var(--color-light)] p-4 border-b border-[var(--color-beige)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="bg-primary/10 p-2 rounded-xl text-primary hidden sm:block">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--color-foreground)] leading-tight">AI Assistant</h1>
              <p className="text-xs text-[var(--color-muted-foreground)] hidden sm:block">Analítica y Herramientas Avanzadas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 hidden md:block">Modelo:</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="text-xs bg-white border border-[var(--color-beige)] rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 text-[var(--color-foreground)] font-medium shadow-sm"
            >
              <option value="mistral">Mistral Large (Recomendado)</option>
              <option value="gemini">Gemini 2.0 Flash</option>
            </select>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-12 space-y-6">
          {(messages as any[]).map((message) => {
            const textPart = message.parts?.find((p: any) => p.type === "text");

            // Skip invisible assistant messages
            if (message.role === "assistant" && !textPart?.text) return null;

            return (
              <div
                key={message.id}
                className={cn(
                  "w-full flex gap-4",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    "bg-blue-100 text-blue-700"
                  )}>
                    <Bot size={16} />
                  </div>
                )}

                {/* Bubble */}
                <div className={cn(
                  "space-y-2 max-w-[95%] md:max-w-[85%] lg:max-w-[75%] min-w-0 overflow-hidden",
                )}>
                  {textPart?.text && (
                    <div className={cn(
                      "py-3 px-5 rounded-2xl text-[15px] leading-relaxed",
                      message.role === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-white border border-[var(--color-beige)] text-gray-800 rounded-tl-sm shadow-sm"
                    )}>
                      {message.role === "user" ? (
                        <div className="break-words whitespace-pre-wrap">{textPart.text}</div>
                      ) : (
                        <div className="overflow-x-auto w-full custom-scrollbar">
                          <div className="prose prose-sm md:prose-base prose-slate max-w-none 
                            prose-p:my-2 prose-p:leading-relaxed
                            prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mb-3 prose-headings:mt-4
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-strong:font-semibold prose-strong:text-gray-900
                            prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
                            prose-table:w-full prose-table:my-4 prose-table:text-sm prose-table:border-collapse
                            prose-th:bg-blue-50 prose-th:p-3 prose-th:text-left prose-th:font-bold prose-th:border prose-th:border-blue-100 prose-th:text-blue-900
                            prose-td:p-3 prose-td:border prose-td:border-gray-200
                            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{textPart.text}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    "bg-primary text-white"
                  )}>
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Global "Trabajando..." indicator when blocked */}
          {isBlocked && (
            <div className="mr-auto w-full flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-blue-100 text-blue-700">
                <Bot size={16} />
              </div>
              <div className="flex flex-col gap-1.5 max-w-[80%]">
                {activeTool ? (
                  // Tool invocation indicator
                  <div className="flex items-center gap-2.5 py-3 px-4 bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-sm text-sm text-amber-800 shadow-sm animate-pulse">
                    <Wrench size={16} className="flex-shrink-0 animate-spin" style={{ animationDuration: "2s" }} />
                    <span className="font-medium">Consultando sistema en vivo: </span>
                    <span className="font-mono text-xs bg-amber-100 px-2 py-1 rounded-md border border-amber-200/50">
                      {TOOL_LABELS[activeTool] || activeTool}
                    </span>
                    <Loader2 size={16} className="animate-spin ml-2 flex-shrink-0" />
                  </div>
                ) : (
                  // Thinking indicator
                  <div className="flex items-center gap-1.5 py-4 px-5 bg-white border border-[var(--color-beige)] rounded-2xl rounded-tl-sm shadow-sm w-24 justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-[var(--color-beige)] shrink-0">
          {/* Status bar when blocked */}
          {isBlocked && (
            <div className="flex items-center justify-center gap-2 mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full py-1.5 px-3 w-fit mx-auto shadow-sm">
              <Loader2 size={12} className="animate-spin" />
              {activeTool
                ? `Consultando ${TOOL_LABELS[activeTool] || activeTool}...`
                : "El asistente está procesando tu mensaje..."}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative max-w-5xl mx-auto flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isBlocked}
              placeholder={isBlocked ? "Esperando respuesta..." : "Pregunta sobre reservas, ventas, horarios..."}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-6 pr-14 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-[var(--color-foreground)] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isBlocked || !input.trim()}
              className="absolute right-3 p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isBlocked ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
          <p className="text-center text-[11px] text-gray-400 mt-3">
            El asistente consulta la base de datos en directo. Puede tardar unos segundos.
          </p>
        </div>
      </div>

    </div>
  );
}
