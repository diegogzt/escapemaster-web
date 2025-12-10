"use client";

import React, { useState } from "react";
import { StickyNote, Plus, X } from "lucide-react";

export function NotesWidget() {
  const [notes, setNotes] = useState<string[]>([
    "Revisar inventario de salas",
    "Llamar a proveedor de bebidas",
  ]);
  const [newNote, setNewNote] = useState("");

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      setNotes([...notes, newNote]);
      setNewNote("");
    }
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-beige h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-dark">Notas Rápidas</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[200px]">
        {notes.map((note, i) => (
          <div
            key={i}
            className="flex items-start justify-between group bg-light p-2 rounded-lg text-sm"
          >
            <span className="text-dark">{note}</span>
            <button
              onClick={() => removeNote(i)}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No hay notas</p>
        )}
      </div>

      <form onSubmit={addNote} className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Nueva nota..."
          className="flex-1 px-3 py-2 text-sm border border-beige rounded-lg focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
