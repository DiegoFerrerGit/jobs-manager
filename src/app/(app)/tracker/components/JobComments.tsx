import { useState } from "react";
import { JobComment } from "../types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import TextareaAutosize from "react-textarea-autosize";
import { Send, Trash2, User } from "lucide-react";

interface JobCommentsProps {
  comments: JobComment[];
  onChange: (comments: JobComment[]) => void;
}

export default function JobComments({ comments, onChange }: JobCommentsProps) {
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: JobComment = {
      id: `comment_${Date.now()}`,
      author: "User", // Can be dynamic if we had auth
      content: newComment.trim(),
      createdAt: new Date()
    };
    
    onChange([...(comments || []), comment]);
    setNewComment("");
  };

  const handleDeleteComment = (id: string) => {
    onChange((comments || []).filter(c => c.id !== id));
  };

  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <h3 className="text-[13px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-4">
        Comentarios
      </h3>
      
      <div className="space-y-4 mb-4">
        {(comments || []).map(comment => (
          <div key={comment.id} className="group flex gap-3">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-[13px]">{comment.author}</span>
                <span className="text-[11px] text-muted-foreground" title={new Date(comment.createdAt).toLocaleString()}>
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                </span>
              </div>
              <div className="text-[13px] text-foreground/90 whitespace-pre-wrap break-words">
                {comment.content}
              </div>
            </div>
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all text-muted-foreground/40 self-start shrink-0"
              title="Eliminar comentario"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-start">
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-white/70" />
        </div>
        <div className="flex-1 relative">
          <TextareaAutosize
            minRows={1}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            placeholder="Añadir un comentario..."
            className="w-full bg-transparent border border-white/10 focus:border-[#555] outline-none text-foreground placeholder:text-muted-foreground px-3 py-2 rounded-lg transition-all text-[13px] resize-none custom-scrollbar pr-10"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="absolute right-2 bottom-2 p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:hover:text-muted-foreground transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
