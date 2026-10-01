import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TextareaAutosize from "react-textarea-autosize";

interface JobNotesProps {
  notes?: string;
  onChange: (notes: string) => void;
}

export default function JobNotes({ notes, onChange }: JobNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      {!isEditing ? (
        <div 
          className="min-h-[100px] cursor-text prose prose-invert max-w-none prose-sm prose-headings:font-semibold prose-a:text-sky-400 hover:bg-white/5 rounded-lg p-2 -mx-2 transition-colors"
          onClick={() => setIsEditing(true)}
        >
          {notes ? (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                input: ({ node, ...props }) => (
                  <input {...props} className="mr-2 accent-sky-400" disabled />
                )
              }}
            >
              {notes}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">Pulsa aquí para añadir notas (Markdown soportado)...</p>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute -top-6 right-0 text-[11px] text-muted-foreground flex gap-3">
            <span># H1</span>
            <span>## H2</span>
            <span>- Lista</span>
            <span>- [ ] Tarea</span>
          </div>
          <TextareaAutosize
            ref={textareaRef}
            minRows={4}
            value={notes || ""}
            onChange={e => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            placeholder="Escribe tus notas aquí... Puedes usar Markdown (# para títulos, - para listas, - [ ] para tareas)."
            className="w-full bg-transparent border border-white/10 focus:border-[#555] outline-none text-foreground placeholder:text-muted-foreground px-3 py-3 rounded-lg transition-all text-sm resize-none custom-scrollbar font-mono"
          />
        </div>
      )}
    </div>
  );
}
