import { useMemo } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface JobNotesProps {
  notes?: string;
  onChange: (notes: string) => void;
}

export default function JobNotes({ notes, onChange }: JobNotesProps) {
  const initialContent = useMemo(() => {
    if (!notes) return undefined;
    try {
      return JSON.parse(notes);
    } catch (e) {
      return [
        {
          type: "paragraph",
          content: notes,
        }
      ];
    }
  }, []); // Only parse on mount

  const editor = useCreateBlockNote({
    initialContent: initialContent as any,
  });

  return (
    <div className="mt-8 pt-6 border-t border-white/10 -mx-6 px-6">
      <h3 className="text-[13px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-4 px-2">
        Notas
      </h3>
      <div className="min-h-[200px] hover:bg-white/5 rounded-lg transition-colors py-2">
        <BlockNoteView
          editor={editor}
          theme="dark"
          onChange={() => {
            onChange(JSON.stringify(editor.document));
          }}
        />
      </div>
    </div>
  );
}
