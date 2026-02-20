"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Settings2 } from "lucide-react";
import { cn } from "@/utils";

export default function ChatbotPage() {
  const [model, setModel] = useState("mistral"); // Switch between mistral and gemini
  
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
       setToken(localStorage.getItem('token'));
    }
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api-chat",
    body: { model },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    initialMessages: [
      {
        id: "sys-01",
        role: "assistant",
        content: "¡Hola! Soy tu Asistente Empresarial propulsado por IA. Puedo consultar reservas en vivo, analizar ingresos financieros o revisar el estatus de las salas. ¿En qué te ayudo hoy?",
      }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
                 <option value="gemini">Google Gemini 2.5</option>
             </select>
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((message: any) => {
              // Hide internal tool calls rendering from the user by filtering text empty messages unless they are active status
              if (message.role === 'assistant' && !message.content && !message.toolInvocations) return null;
              
              return (
                  <div 
                    key={message.id} 
                    className={cn(
                        "max-w-[85%] flex gap-3",
                        message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                      <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                          message.role === 'user' ? "bg-primary text-white" : "bg-blue-100 text-blue-700"
                      )}>
                          {message.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
                      </div>
                      
                      <div className="space-y-2 max-w-full overflow-hidden">
                          {message.content && (
                              <div className={cn(
                                "py-3 px-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                                message.role === 'user' 
                                    ? "bg-primary text-white rounded-tr-sm" 
                                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                              )}>
                                {message.content}
                              </div>
                          )}

                          {/* Render Tool Invocations for transparency */}
                          {message.toolInvocations?.map((toolInvocation: any, index: number) => {
                              const toolCallId = toolInvocation.toolCallId;
                              if (toolInvocation.state === 'call') {
                                  return (
                                    <div key={toolCallId} className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-lg w-fit animate-pulse border border-blue-100">
                                      <Loader2 size={12} className="animate-spin" />
                                      Ejecutando herramienta: <span className="font-mono">{toolInvocation.toolName}</span>...
                                    </div>
                                  );
                              }
                              // We don't render the raw JSON output to keep it clean, the LLM will summarize it
                              return null; 
                          })}
                      </div>
                  </div>
              );
          })}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="max-w-[85%] flex gap-3 mr-auto">
                   <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-blue-100 text-blue-700">
                        <Bot size={16}/>
                   </div>
                   <div className="flex items-center gap-1.5 py-4 px-4 bg-gray-100 rounded-2xl rounded-tl-sm w-16 justify-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                   </div>
              </div>
          )}
          
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[var(--color-light)] border-t border-[var(--color-beige)]">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center">
            <input
              type="text"
              name="prompt"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Pregunta sobre reservas, ventas, horarios..."
              className="w-full bg-white border border-[var(--color-beige)] rounded-full pl-6 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow text-[var(--color-foreground)] shadow-sm disabled:opacity-60"
            />
            <button
               type="submit"
               disabled={isLoading || !input.trim()}
               className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
            >
                <Send size={18} className={cn(isLoading && "animate-pulse")} />
            </button>
        </form>
        <p className="text-center text-[10px] text-[var(--color-muted-foreground)] mt-3">
          El asistente consulta la base de datos en directo. Puede tardar unos segundos en consolidar reportes grandes.
        </p>
      </div>
    </div>
  );
}
